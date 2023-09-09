"use client";
import { useEffect } from "react";

/**
 * Modified Flowbite carousel class
 * @author Flowbite
 * @see https://github.com/themesberg/flowbite/blob/main/src/components/carousel/index.ts
 * @class Carousel
 */
class Carousel {
  private indicators: HTMLDivElement;
  private container: HTMLDivElement;
  private nextBtn: HTMLButtonElement | null;
  private prevBtn: HTMLButtonElement | null;
  private position = 0;
  private length = 0;
  /**
   * Try to cleanup handlers on dismount
   * @see https://stackoverflow.com/questions/4950115/removeeventlistener-on-anonymous-functions-in-javascript
   * @private
   * @type {(NodeJS.Timeout | undefined)}
   * @memberof Carousel
   */
  private intervalInst: NodeJS.Timeout | undefined;
  private indicatorHandlers: (() => void)[] = [];
  constructor(
    private target: string,
    private interval = 8000,
  ) {
    const root = document.getElementById(this.target);
    if (!root) throw new Error("Failed to init carousel");

    const container = root.querySelector<HTMLDivElement>(
      "[data-carousel-container]",
    );
    const indicators = root.querySelector<HTMLDivElement>(
      "[data-carousel-indicators]",
    );
    if (!container || !indicators) throw new Error("Failed to init carousel");

    this.indicators = indicators;
    this.container = container;

    this.nextBtn = root.querySelector("button[data-carousel-next]");
    this.prevBtn = root.querySelector("button[data-carousel-prev]");

    this.init();
  }

  private init() {
    this.length = this.indicators.children.length;

    for (let i = 0; i < this.length; i++) {
      const el = this.indicators.children.item(i);

      this.indicatorHandlers.push(() => this.slideTo(i));

      (el as HTMLButtonElement).addEventListener(
        "click",
        this.indicatorHandlers[i]!,
      );
    }

    this.nextBtn?.addEventListener("click", this.next);
    this.prevBtn?.addEventListener("click", this.prev);

    this.slideTo(0);
    this.cycle();
  }

  public next = () => {
    const next = this.position === this.length - 1 ? 0 : this.position + 1;
    this.slideTo(next);
  };
  public prev = () => {
    const prev = this.position === 0 ? this.length - 1 : this.position - 1;
    this.slideTo(prev);
  };

  private slideTo(idx: number) {
    const rotation = {
      left: idx === 0 ? this.length - 1 : idx - 1,
      middle: idx,
      right: idx === this.length - 1 ? 0 : idx + 1,
    };

    this.rotate(rotation);
    this.setActive(idx);
    if (this.intervalInst) {
      this.pause();
      this.cycle();
    }
  }

  private rotate(rotationItems: {
    left: number;
    middle: number;
    right: number;
  }) {
    for (const el of this.container.children) {
      el.classList.add("hidden");
    }

    const left = this.container.children.item(rotationItems.left);
    const right = this.container.children.item(rotationItems.right);
    const middle = this.container.children.item(rotationItems.middle);
    if (!left || !middle || !right) return;

    left.classList.remove(
      "-translate-x-full",
      "translate-x-full",
      "translate-x-0",
      "hidden",
      "z-20",
    );
    left.classList.add("-translate-x-full", "z-10");

    middle.classList.remove(
      "-translate-x-full",
      "translate-x-full",
      "translate-x-0",
      "hidden",
      "z-10",
    );
    middle.classList.add("translate-x-0", "z-20");

    right.classList.remove(
      "-translate-x-full",
      "translate-x-full",
      "translate-x-0",
      "hidden",
      "z-20",
    );
    right.classList.add("translate-x-full", "z-10");
  }

  public setActive(idx: number) {
    this.position = idx;

    for (const el of this.indicators.children) {
      el.setAttribute("aria-current", "false");
    }
    this.indicators.children.item(idx)?.setAttribute("aria-current", "true");
  }

  public pause() {
    clearInterval(this.intervalInst);
  }

  public cycle() {
    this.intervalInst = setInterval(this.next, this.interval);
  }

  public destory() {
    for (let i = 0; i < this.length; i++) {
      const el = this.indicators.children.item(i);
      (el as HTMLButtonElement).removeEventListener(
        "click",
        this.indicatorHandlers[i]!,
      );
    }

    this.nextBtn?.removeEventListener("click", this.next);
    this.prevBtn?.removeEventListener("click", this.prev);

    this.pause();

    this.indicatorHandlers = [];
  }
}

const Runtime: React.FC<{ id: string }> = ({ id }) => {
  useEffect(() => {
    const carousel = new Carousel(id);
    return () => {
      carousel.destory();
    };
  }, [id]);
  return null;
};

export default Runtime;
