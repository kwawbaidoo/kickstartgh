import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 3)
    .join("")
    .toUpperCase()
}

/**
 * Base UI's <Select.Value> renders the raw selected value unless the Root
 * is given an `items` map, so every Select needs one built from its options.
 */
export function toSelectItems<T extends string>(
  options: readonly T[] | readonly { value: T; label: string }[]
): Record<string, string> {
  return Object.fromEntries(
    options.map((option) =>
      typeof option === "string" ? [option, option] : [option.value, option.label]
    )
  )
}
