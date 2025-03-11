import { onCleanup, onMount, type FlowComponent } from "solid-js";
import PullToRefresh from 'pulltorefreshjs';
import MdiRefresh from '~icons/mdi/refresh'

const PullableScreen: FlowComponent<{
  onRefresh: () => void;
}> = (props) => {
  const iconArrow = <MdiRefresh
    class="text-white/75 text-2xl rounded-full p-1"
  />

  const iconRefreshing = <MdiRefresh
    class="text-white/75 text-2xl rounded-full p-1 animate-spin"
  />

  onMount(() => {
    PullToRefresh.init({
      mainElement: "main",
      onRefresh: () => props.onRefresh(),
      iconArrow: (iconArrow as unknown as SVGElement).outerHTML,
      iconRefreshing: (iconRefreshing as unknown as SVGElement).outerHTML,

      refreshTimeout: 250,
      distThreshold: 75,
      distReload: 75,
      distMax: 85,

      getStyles() {
        return `
.__PREFIX__ptr {
  pointer-events: none;
  font-size: 0.85em;
  font-weight: 600;
  top: 0;
  height: 0;
  transition: height 0.3s, min-height 0.3s;
  background: transparent;
  text-align: center;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  align-content: stretch;
}

.__PREFIX__box {
  padding: 10px;
  flex-basis: 100%;
}

.__PREFIX__pull {
  transition: none;
}

.__PREFIX__text {
  margin-top: .33em;
  color: rgba(255, 255, 255, 0.5);
}

.__PREFIX__icon {
  color: white;
  width: fit-content;
  margin-inline: auto;
}

.__PREFIX__icon {
  transform: rotate(180deg);
  transition: transform .3s;
}

.__PREFIX__top {
  touch-action: pan-x pan-down pinch-zoom;
}

.__PREFIX__release .__PREFIX__icon {
  transform: rotate(0deg);
  transition: transform .3s;
}
`
      }
    })
  });

  onCleanup(() => {
    PullToRefresh.destroyAll();
  })

  return props.children;
};

export default PullableScreen;
