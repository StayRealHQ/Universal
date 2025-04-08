import { type Component, createSignal, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { createStore } from "solid-js/store";
import { content_posts_create, content_posts_upload_url } from "~/api/requests/content/posts/upload";
import auth from "~/stores/auth";
import { compressWebpToSize, convertJpegToWebp } from "@stayreal/api";
import uploadToGoogleStorageBucket from "~/api/core/uploadToGoogleStorageBucket";
import MdiChevronLeft from "~icons/mdi/chevron-left";
import MingcuteUploadLine from "~icons/mingcute/upload-line";

const UploadFileView: Component = () => {
  const navigate = useNavigate();
  const [frontImage, setFrontImage] = createSignal<File>();
  const [backImage, setBackImage] = createSignal<File>();
  const [state, setState] = createStore({
    uploading: false,
    compressing: false,
  });

  const canvasSize = { width: 1500, height: 2000 };

  const drawImageToCanvas = async (file: File): Promise<File> => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    await new Promise<void>((resolve) => (img.onload = () => resolve()));

    const canvas = document.createElement("canvas");
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    const imageAspect = img.width / img.height;
    const canvasAspect = canvas.width / canvas.height;

    let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
    if (imageAspect > canvasAspect) {
      drawHeight = canvas.height;
      drawWidth = img.width * (canvas.height / img.height);
      offsetX = (canvas.width - drawWidth) / 2;
    } else {
      drawWidth = canvas.width;
      drawHeight = img.height * (canvas.width / img.width);
      offsetY = (canvas.height - drawHeight) / 2;
    }

    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

    const jpegBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) reject("Failed to create JPEG blob");
        else resolve(blob);
      }, "image/jpeg");
    });

    return new File([jpegBlob], "resized.jpeg", { type: "image/jpeg" });
  };

  const compressAndConvert = async (file: File): Promise<File> => {
    const resized = await drawImageToCanvas(file);
    const buffer = await resized.arrayBuffer();
    let image = await convertJpegToWebp(new Uint8Array(buffer));
    if (image.byteLength > 1_000_000) {
      image = await compressWebpToSize(image, 1_000_000);
    }
    const blob = new Blob([image], { type: "image/webp" });
    return new File([blob], "image.webp", { type: "image/webp" });
  };

  const handleUpload = async () => {
    try {
      setState({ compressing: true });

      const [frontWebp, backWebp] = await Promise.all([
        compressAndConvert(frontImage()!),
        compressAndConvert(backImage()!)
      ]);

      setState({ compressing: false, uploading: true });

      if (auth.isDemo()) {
        const { DEMO_CONTENT_POSTS_UPLOAD } = await import("~/api/demo/content/posts/upload");
        await DEMO_CONTENT_POSTS_UPLOAD(frontWebp, backWebp, new Date());
      } else {
        const { data: bucket } = await content_posts_upload_url();

        await Promise.all([
          uploadToGoogleStorageBucket(bucket[0].url, bucket[0].headers, backWebp),
          uploadToGoogleStorageBucket(bucket[1].url, bucket[1].headers, frontWebp)
        ]);

        await content_posts_create({
          isLate: false,
          takenAt: new Date(),
          backCameraWidth: canvasSize.width,
          backCameraHeight: canvasSize.height,
          backCameraPath: bucket[0].path,
          backBucketName: bucket[0].bucket,
          frontCameraWidth: canvasSize.width,
          frontCameraHeight: canvasSize.height,
          frontCameraPath: bucket[1].path,
          frontBucketName: bucket[1].bucket,
          retakeCounter: 0
        });
      }

      navigate("/feed/friends");
    } finally {
      setState({ uploading: false, compressing: false });
    }
  };

  const imageBox = (label: string, image: File | undefined, onSelect: (f: File) => void) => (
    <label class="relative w-40 h-52 bg-white/5 rounded-lg border border-white/20 flex items-center justify-center cursor-pointer overflow-hidden">
      <input
        type="file"
        accept="image/*"
        class="absolute inset-0 opacity-0 cursor-pointer"
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (file) onSelect(file);
        }}
      />
      <Show when={image} fallback={
        <div class="flex flex-col items-center text-white/60">
          <MingcuteUploadLine class="text-3xl mb-1" />
          <span class="text-sm">{label}</span>
        </div>
      }>
        <img
          src={URL.createObjectURL(image!)}
          alt={`${label} Preview`}
          class="w-full h-full object-cover"
        />
      </Show>
    </label>
  );

  return (
    <div class="min-h-screen flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <header>
        <nav class="flex items-center justify-between px-4 h-[72px]">
          <a href="/upload" class="p-2.5 rounded-full ml-[-10px]" aria-label="Back to feed">
            <MdiChevronLeft class="text-2xl" />
          </a>
        </nav>
      </header>

      <main class="flex-1 flex flex-col items-center justify-center gap-6 px-4">
        <div class="flex gap-4 mt-4">
          {imageBox("Front", frontImage(), setFrontImage)}
          {imageBox("Back", backImage(), setBackImage)}
        </div>

        <Show when={frontImage() && backImage()}>
          <button
            onClick={handleUpload}
            disabled={state.uploading || state.compressing}
            class="bg-white text-black font-600 py-3.5 px-8 rounded-2xl mt-4"
          >
            {state.compressing && "Compressing..."}
            {state.uploading && "Uploading..."}
            {!state.compressing && !state.uploading && "Upload"}
          </button>
        </Show>
      </main>
    </div>
  );
};

export default UploadFileView;
