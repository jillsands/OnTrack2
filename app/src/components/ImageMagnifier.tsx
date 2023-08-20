import { useEffect, useRef } from "react";
import "./components.css";

type Props = {
  imageSrc: string;
};

const ImageMagnifier = ({ imageSrc }: Props) => {
  const ZOOM = 2.75;
  let img = useRef<HTMLElement | null>();
  let glass = useRef<HTMLElement | null>();

  useEffect(() => {
    img.current = document.getElementById("metroMap");
    glass.current = document.getElementById("magnifierGlass");

    if (
      glass.current instanceof HTMLElement &&
      img.current instanceof HTMLImageElement
    ) {
      /* Show/hide magnifier */
      glass.current.addEventListener("mousemove", moveMagnifier);
      img.current.addEventListener("mousemove", moveMagnifier);
      glass.current.addEventListener(
        "mouseout",
        () => ((glass.current as HTMLElement).style.visibility = "hidden")
      );
    }
  }, []);

  const moveMagnifier = (e: MouseEvent) => {
    if (
      glass.current instanceof HTMLElement &&
      img.current instanceof HTMLImageElement
    ) {
      const bw = 3;
      const w = glass.current.offsetWidth / 2;
      const h = glass.current.offsetHeight / 2;

      e.preventDefault();

      const pos = getCursorPos(e);
      let x = pos.x;
      let y = pos.y;

      if (x > img.current.width - w / ZOOM) {
        x = img.current.width - w / ZOOM;
      }
      if (x < w / ZOOM) {
        x = w / ZOOM;
      }
      if (y > img.current.height - h / ZOOM) {
        y = img.current.height - h / ZOOM;
      }
      if (y < h / ZOOM) {
        y = h / ZOOM;
      }

      /* Set the position of the magnifier glass: */
      glass.current.style.left = x - w + "px";
      glass.current.style.top = y - h + "px";

      /* Display what the magnifier glass sees */
      glass.current.style.visibility = "visible";
      glass.current.style.backgroundPosition =
        "-" + (x * ZOOM - w + bw) + "px -" + (y * ZOOM - h + bw) + "px";
    }
  };

  const getCursorPos = (e: MouseEvent) => {
    let a,
      x = 0,
      y = 0;

    if (img.current instanceof HTMLImageElement) {
      e = e || window.event;

      /* Get the x and y positions of the image: */
      a = img.current.getBoundingClientRect();

      /* Calculate the cursor's x and y coordinates, relative to the image: */
      x = e.pageX - a.left;
      y = e.pageY - a.top;

      /* Consider any page scrolling: */
      x = x - window.scrollX;
      y = y - window.scrollY;
      return { x, y };
    } else {
      return { x: 0, y: 0 };
    }
  };

  /* Set zoom for the magnifier glass */
  const handleImgLoad = () => {
    if (
      glass.current instanceof HTMLElement &&
      img.current instanceof HTMLImageElement
    ) {
      glass.current.style.backgroundSize =
        img.current.width * ZOOM + "px " + img.current.height * ZOOM + "px";
    }
  };

  return (
    <>
      <div id="magnifierGlass"> </div>
      <img
        id="metroMap"
        src={imageSrc}
        alt="WMATA Metro map"
        onLoad={handleImgLoad}
      />
    </>
  );
};

export default ImageMagnifier;
