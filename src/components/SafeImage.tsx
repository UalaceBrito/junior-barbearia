import { getImageProps, type ImageProps } from "next/image";

// next/image injeta style="color:transparent" no <img>, o que viola a CSP
// (style-src sem 'unsafe-inline'). Aqui descartamos o style inline e mantemos
// srcset/sizes/loading otimizados.
export function SafeImage(props: ImageProps) {
  const { props: imgProps } = getImageProps(props);
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...imgProps} alt={props.alt} style={undefined} />;
}
