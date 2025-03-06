import { type Component, createSignal, Show } from "solid-js";
import { content_posts_create, content_posts_upload_url } from "~/api/requests/content/posts/upload";
import { useNavigate } from "@solidjs/router";
import auth from "~/stores/auth";
import { compressWebpToSize, convertJpegToWebp } from "@stayreal/api";
import { wait } from "~/utils/wait";
import MdiChevronLeft from '~icons/mdi/chevron-left'
import { createStore } from "solid-js/store";
import uploadToGoogleStorageBucket from "~/api/core/uploadToGoogleStorageBucket";

const UploadView: Component = () => {
  const navigate = useNavigate();

  /**
   * We can't create two streams at the same time because of iOS limitations
   * so we have to update the stream when the user switches cameras.
   */
  const updateCameraStream = async (facingMode: "user" | "environment"): Promise<void> => {
    try {
      // Close the previous stream.
      if (stream()) stream()!.getTracks().forEach(track => track.stop());
      setStream(undefined);

      await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { exact: facingMode } }
      }).then(setStream);
    }
    catch (error) {
      console.error("error getting stream:", error);
    }
  };

  // When the user first loads the page, we want to show the back camera.
  const [stream, setStream] = createSignal<MediaStream | undefined>();
  updateCameraStream("environment");

  const [frontVideo, setFrontVideo] = createSignal<HTMLVideoElement>();
  const [backVideo, setBackVideo] = createSignal<HTMLVideoElement>();
  const [frontVideoPreview, setFrontVideoPreview] = createSignal<HTMLCanvasElement>();
  const [backVideoPreview, setBackVideoPreview] = createSignal<HTMLCanvasElement>();

  const calculateDimensionsForCanvas = (width: number, height: number, canvas: HTMLCanvasElement) => {
    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("could not get canvas context");
    }

    const outputWidth = 1500;
    const outputHeight = 2000;

    // Set canvas dimensions to fixed size (1500x2000)
    canvas.width = outputWidth;
    canvas.height = outputHeight;

    // Calculate video scaling to maintain aspect ratio while covering the canvas area
    const videoAspectRatio = width / height;
    const canvasAspectRatio = outputWidth / outputHeight;

    let drawHeight: number;
    let drawWidth: number;
    let offsetX: number;
    let offsetY: number;

    if (videoAspectRatio > canvasAspectRatio) {
      // Video is wider than the canvas aspect ratio
      drawHeight = outputHeight;
      drawWidth = width * (outputHeight / height);
      offsetX = (outputWidth - drawWidth) / 2;  // Center horizontally
      offsetY = 0;
    }
    else {
      // Video is taller than the canvas aspect ratio
      drawHeight = height * (outputWidth / width);
      drawWidth = outputWidth;
      offsetX = 0;
      offsetY = (outputHeight - drawHeight) / 2;  // Center vertically
    }

    return { drawHeight, drawWidth, offsetX, offsetY };
  }

  /**
   * Capture an image from the <video> element and
   * displays the preview on the <canvas> element.
   */
  const captureFromVideo = async (video: HTMLVideoElement, canvas: HTMLCanvasElement): Promise<File> => new Promise((resolve, reject) => {
    const context = canvas.getContext("2d");

    if (!context) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    const {
      drawHeight,
      drawWidth,
      offsetX,
      offsetY
    } = calculateDimensionsForCanvas(video.videoWidth, video.videoHeight, canvas);

    if (video === frontVideo()) { // we need to mirror for the front camera
      context.save();
      context.scale(-1, 1); // flip horizontally
      context.drawImage(video, -offsetX - drawWidth, offsetY, drawWidth, drawHeight);
      context.restore();
    }
    else {
      context.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
    }

    renderToBlob(canvas)
      .then(resolve)
      .catch(reject);
  });

  const [frontImage, setFrontImage] = createSignal<File | undefined>(undefined);
  const [backImage, setBackImage] = createSignal<File | undefined>(undefined);
  const isCapturingPrimary = () => frontImage() === undefined && backImage() === undefined;

  const [state, setState] = createStore({
    capturing: false,
    uploading: false,
    compressing: false,
    reversed: false,
  });

  const handleCapture = async (): Promise<void> => {
    try {
      setState("capturing", true);

      if (state.reversed) {
        const image = await captureFromVideo(frontVideo()!, frontVideoPreview()!);
        setFrontImage(image);
      }
      else {
        const image = await captureFromVideo(backVideo()!, backVideoPreview()!);
        setBackImage(image);
      }

      await updateCameraStream(state.reversed ? "environment" : "user");
      await wait(2000);

      if (state.reversed) {
        const image = await captureFromVideo(backVideo()!, backVideoPreview()!);
        setBackImage(image);
      }
      else {
        const image = await captureFromVideo(frontVideo()!, frontVideoPreview()!);
        setFrontImage(image);
      }
    }
    finally {
      setState("capturing", false);
    }
  }

  const handleUpload = async () => {
    try {
      setState("compressing", true); // and converting to WebP...

      // Compress and convert images to WebP.
      const [backWebpImage, frontWebpImage] = await Promise.all([backImage(), frontImage()].map(async (file) => {
        if (!file) throw new Error("an image is missing");

        // Sending data over Tauri's IPC requires Uint8Array for bytes.
        const buffer = await file.arrayBuffer();
        let image = new Uint8Array(buffer);

        // BeReal only supports WebP images so we need conversion.
        image = await convertJpegToWebp(image);

        // 1MB is the maximum size for the image to be uploaded.
        const MAX_SIZE = 1000000;

        if (image.byteLength > MAX_SIZE) {
          image = await compressWebpToSize(image, MAX_SIZE);
        }

        const blob = new Blob([image], { type: "image/webp" });
        file = new File([blob], "image.webp", { type: "image/webp" });
        return file;
      }));

      setState({
        compressing: false,
        uploading: true,
      });

      if (auth.isDemo()) {
        const { DEMO_CONTENT_POSTS_UPLOAD } = await import("~/api/demo/content/posts/upload");
        await DEMO_CONTENT_POSTS_UPLOAD(frontWebpImage, backWebpImage, new Date());
      }
      else {
        // Get the signed URLs for uploading the images.
        const { data: bucket } = await content_posts_upload_url();

        // Upload the images to the bucket.
        await Promise.all([
          uploadToGoogleStorageBucket(bucket[0].url, bucket[0].headers, backWebpImage),
          uploadToGoogleStorageBucket(bucket[1].url, bucket[1].headers, frontWebpImage)
        ]);

        // Create the post with the uploaded images.
        await content_posts_create({
          // NOTE: always `false` when it's not the primary post...
          isLate: false,
          takenAt: new Date(),

          backCameraWidth: 1500,
          backCameraHeight: 2000,
          backCameraPath: bucket[0].path,
          backBucketName: bucket[0].bucket,

          frontCameraWidth: 1500,
          frontCameraHeight: 2000,
          frontCameraPath: bucket[1].path,
          frontBucketName: bucket[1].bucket,


          // TODO: probably increment each time you hit the "cancel" button
          retakeCounter: 0,

          // TODO: geolocation, if available
          // location: {
          //   latitude: 45,
          //   longitude: 1
          // }
        });

        // TODO: show an alert or something
      }

      // Navigate to the feed to see the new post.
      navigate("/feed/friends");
    }
    finally {
      setState({
        compressing: false,
        uploading: false
      })
    }
  };

  // const handleFileSelector = async (type: "front" | "back") => {
  //   const input = document.createElement("input");
  //   input.type = "file";
  //   input.accept = "image/*";
  //   input.onchange = async () => {
  //     if (!input.files || input.files.length === 0) return;
  //     const file = input.files[0];

  //     // we should draw to canvas !
  //     const image = new Image();
  //     image.src = URL.createObjectURL(file);

  //     const canvas = (type === "front") ? frontVideoPreview : backVideoPreview;

  //     if (!canvas) {
  //       console.error("could not get canvas element");
  //       return;
  //     }

  //     const context = canvas.getContext("2d");

  //     if (!context) {
  //       console.error("could not get canvas context");
  //       return;
  //     }

  //     image.onload = async () => {
  //       const {
  //         drawHeight,
  //         drawWidth,
  //         offsetX,
  //         offsetY
  //       } = coverImageForCanvas(image.width, image.height, canvas);

  //       context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  //       const blob = await renderToBlob(canvas);

  //       if (type === "front") setFrontImage(blob);
  //       else setBackImage(blob);
  //     };
  //   };
  //   input.click();
  // };

  const renderToBlob = async (canvas: HTMLCanvasElement): Promise<File> => {
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) reject(new Error("failed to render image"));
          else resolve(blob);
        },
        // We use have to use `image/jpeg` because `image/webp` is not supported in Safari (WebView for macOS/iOS)
        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob#browser_compatibility
        "image/jpeg"
      );
    });

    return new File([blob], "image.jpeg", { type: "image/jpeg" });
  }

  return (
    <div class="min-h-screen grid gap-4 rows-[auto_1fr_auto] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <header>
        <nav class="flex items-center justify-between px-4 h-[72px]">
          <a href="/feed/friends" class="p-2.5 rounded-full ml-[-10px]" aria-label="Back to feed">
            <MdiChevronLeft class="text-2xl" />
          </a>
          <Show when={backImage() && frontImage()}>
            <button type="button"
              onClick={() => {
                setBackImage(undefined);
                setFrontImage(undefined);
                // We revert the camera to original state.
                updateCameraStream(!state.reversed ? "environment" : "user");
              }}
            >
              Retry
            </button>
          </Show>
        </nav>
      </header>

      <div class="relative mx-auto"
        style={{
          // width: "100vw",
          // height: "calc(100vw * (1500 / 2000))",
          // "max-height": "100%",
          // "max-width": "calc(100% * (2000 / 1500))"

          // TODO: fix this to be responsive, it's very hard...
          height: "min(100vw, calc(50vh * (2000 / 1500)))",
          width: "min(50vh, calc(100vw * (1500 / 2000)))"
        }}
      >
        <Show when={!stream()}>
          <div class="absolute inset-0 flex items-center justify-center">
            <p class="text-white text-center">
              Loading stream...
            </p>
          </div>
        </Show>

        <canvas ref={!state.reversed ? setBackVideoPreview : setFrontVideoPreview}
          class="absolute inset-0 z-5 rounded-2xl h-full w-full object-cover"
          classList={{ "opacity-0": (backImage() === undefined && frontImage() === undefined) }}
        />

        {/* @ts-expect-error : special directive ("prop:") */}
        <video ref={!state.reversed ? setBackVideo : setFrontVideo} prop:srcObject={stream()}
          class="absolute inset-0 z-0 rounded-2xl h-full w-full object-cover"
          classList={{ "opacity-0": !isCapturingPrimary(), "transform-rotate-y-180": state.reversed }}
          playsinline={true}
          controls={false}
          autoplay={true}
        />

        <div class="absolute top-4 left-4 w-full max-w-[calc(20vh*(1500/2000))] h-20vh">
          <canvas ref={!state.reversed ? setFrontVideoPreview : setBackVideoPreview}
            class="absolute inset-0 z-15 rounded-xl h-full w-full object-cover border-2 border-black"
            classList={{ "opacity-0": (!state.reversed ? frontImage() === undefined : backImage() === undefined) || isCapturingPrimary() }}
          />
        </div>

        {/* @ts-expect-error : special directive ("prop:") */}
        <video ref={!state.reversed ? setFrontVideo : setBackVideo} prop:srcObject={stream()}
          class="absolute inset-0 z-10 rounded-2xl h-full w-full object-cover"
          classList={{
            "opacity-0": isCapturingPrimary() || (backImage() !== undefined && frontImage() !== undefined),
            "transform-rotate-y-180": !state.reversed
          }}
          playsinline={true}
          controls={false}
          autoplay={true}
        />
      </div>

      <div class="pb-8 pt-4 flex justify-center px-4 items-center">
        <Show when={!frontImage() || !backImage()}>
          <button
            type="button"
            title="Capture"
            disabled={state.capturing}
            class="h-24 w-24 bg-white/5 border-6 border-white rounded-full disabled:(bg-white animate-pulse animation-duration-100)"
            onClick={() => handleCapture()}
          />
        </Show>

        <Show when={frontImage() && backImage()}>
          <button type="button"
            disabled={state.uploading || state.compressing}
            onClick={() => handleUpload()}
            class="bg-white text-black font-600 py-3.5 px-8 rounded-2xl mx-auto"
          >
            {!state.uploading && !state.compressing && "Upload"}
            {state.compressing && "Compressing..."}
            {state.uploading && "Uploading..."}
          </button>
        </Show>
      </div>
    </div>
  )
};

export default UploadView;
