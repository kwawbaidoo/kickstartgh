import { getInitials } from "@/lib/utils";

type GalleryTileProps = {
  photo?: string;
  name: string;
  identification: string;
};

function GalleryTile({ photo, name, identification }: GalleryTileProps) {
  return (
    <button
      type="button"
      className="group relative aspect-square overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`${identification} - ${name}`}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className="size-full object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center bg-primary text-2xl font-semibold text-primary-foreground">
          {getInitials(name)}
        </div>
      )}
      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/85 via-black/10 to-transparent p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100">
        <span className="text-xs font-medium text-white">
          {identification} - {name}
        </span>
      </div>
    </button>
  );
}

export { GalleryTile };
