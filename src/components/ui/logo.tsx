/**
 * The Conferencer mark: an open ring with a handoff wedge — the call goes out,
 * the programme comes back.
 *
 * The ring follows `currentColor`, so the same SVG sits on paper (ink ring) and
 * on the dark bands (paper ring) with no variant prop. The wedge and dot are
 * the system's one chromatic colour, `--color-signal` — the logo is its
 * sanctioned fourth use (design.md § Theme).
 *
 * The source SVG shipped its paths mirrored about the horizontal axis; the
 * group transform un-mirrors them so the wedge reads as moving forward
 * (rightward). The flip translation (1088.863) centres the ring inside the
 * viewBox — flip about 1010 leaves the ring riding visibly high, because the
 * ring's own vertical centre is y=544.4, not 505. The viewBox is the mark's
 * own square; the surrounding frame of the source file is dropped.
 *
 * Decorative by default, like <Icon>: it always sits beside the wordmark,
 * which already names the product.
 */
export function LogoMark({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="154.25 418.9 300 300"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <g transform="matrix(1 0 0 -1 0 1088.863)">
        <path
          fill="currentColor"
          d="M292.522 404.706C294.627 404.305 300.983 404.194 303.315 404.122C325.737 403.28 348.021 407.983 368.191 417.814C386.628 426.689 412.78 446.12 422.651 465.566C424.42 469.051 423.739 476.876 418.883 477.446C417.34 477.789 412.578 477.124 411.487 475.832C401.41 463.905 393.785 454.125 380.958 444.645C354.244 424.807 320.675 416.545 287.805 421.718C255.282 426.79 226.051 444.432 206.408 470.845C186.936 496.921 178.741 529.719 183.661 561.888C194.24 629.726 260.26 674.353 327.354 663.699C356.387 659.415 387.445 641.415 404.632 617.539C406.997 614.253 411.16 607.765 415.024 606.524C417.376 605.76 419.944 606.067 422.05 607.364C430.016 612.38 422.893 621.834 419.04 626.761C395.792 656.5 361.255 676.727 323.606 680.966C285.941 685.583 248.013 674.741 218.479 650.914C189.571 628.074 170.933 594.676 166.674 558.081C162.731 521.226 173.767 484.334 197.299 455.698C220.947 426.654 255.241 408.29 292.522 404.706Z"
        />
        <path
          fill="var(--color-signal)"
          d="M435.252 490.674L436.851 490.888C440.054 496.485 443.138 511.025 444.482 517.775C449.692 543.959 445.805 567.532 437.914 592.597C407.399 583.445 376.187 573.041 345.583 563.557C332.38 559.581 319.215 555.478 306.091 551.25C308.527 544.414 307.951 540.306 305.957 533.604L435.252 490.674Z"
        />
        <path
          fill="var(--color-signal)"
          d="M268.747 522.059C280.295 519.34 291.849 526.545 294.488 538.112C297.128 549.678 289.844 561.182 278.259 563.742C266.787 566.278 255.418 559.079 252.804 547.624C250.19 536.169 257.31 524.752 268.747 522.059Z"
        />
      </g>
    </svg>
  );
}
