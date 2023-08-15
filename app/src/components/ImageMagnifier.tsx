import { useEffect } from "react";
import "./components.css";

type Props = {
  imageSrc: string;
};

const ImageMagnifier = ({ imageSrc }: Props) => {
  const img = document.getElementById("metroMap");
  const glass = document.getElementById("img-magnifier-glass");
  const zoom = 2.75;

  useEffect(() => {
    /* Set zoom for the magnifier glass */
    if (img instanceof HTMLImageElement && glass) {
      glass.style.backgroundSize =
        img.width * zoom + "px " + img.height * zoom + "px";

      /* Show/hide magnifier */
      glass.addEventListener("mousemove", moveMagnifier);
      img.addEventListener("mousemove", moveMagnifier);
      glass.addEventListener(
        "mouseout",
        () => (glass.style.visibility = "hidden")
      );
    }
  });

  function moveMagnifier(e: MouseEvent) {
    if (img instanceof HTMLImageElement && glass) {
      const bw = 3;
      const w = glass.offsetWidth / 2;
      const h = glass.offsetHeight / 2;

      e.preventDefault();

      const pos = getCursorPos(e);
      let x = pos.x;
      let y = pos.y;

      if (x > img.width - w / zoom) {
        x = img.width - w / zoom;
      }
      if (x < w / zoom) {
        x = w / zoom;
      }
      if (y > img.height - h / zoom) {
        y = img.height - h / zoom;
      }
      if (y < h / zoom) {
        y = h / zoom;
      }

      /* Set the position of the magnifier glass: */
      glass.style.left = x - w + "px";
      glass.style.top = y - h + "px";

      /* Display what the magnifier glass sees */
      glass.style.visibility = "visible";
      glass.style.backgroundPosition =
        "-" + (x * zoom - w + bw) + "px -" + (y * zoom - h + bw) + "px";
    }
  }

  function getCursorPos(e: MouseEvent) {
    let a,
      x = 0,
      y = 0;

    if (img instanceof HTMLImageElement) {
      e = e || window.event;

      /* Get the x and y positions of the image: */
      a = img.getBoundingClientRect();

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
  }

  return (
    <>
      <div id="img-magnifier-glass"> </div>
      <img id="metroMap" src={imageSrc} alt="WMATA Metro map" />
    </>
  );
};

export default ImageMagnifier;
