import { appScreens } from "../../data/appScreens";

type AppPhoneProps = {
  screen: (typeof appScreens)[number]["id"];
  priority?: boolean;
};

/** A static product image, sharing the same sources as the interactive tour. */
export function AppPhone({ screen, priority = false }: AppPhoneProps) {
  const content = appScreens.find((item) => item.id === screen)!;
  return (
    <figure className="app-phone">
      <img src={content.image} alt={content.alt} width={944} height={2048} loading={priority ? "eager" : "lazy"} decoding="async" />
    </figure>
  );
}
