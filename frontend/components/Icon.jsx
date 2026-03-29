export function Icon({ name, fill, size = 20, color, style, ...rest }) {
  return (
    <span
      className={`icon ${fill ? "icon-fill" : ""}`}
      style={{ fontSize: size, color, lineHeight: 1, ...style }}
      {...rest}
    >
      {name}
    </span>
  );
}
