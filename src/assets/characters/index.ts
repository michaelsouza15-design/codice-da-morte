export const CHARACTER_IMAGES: string[] = Array.from({ length: 42 }, (_, i) => {
  const pad = String(i).padStart(2, '0');
  return `/characters/char_${pad}.png?v=42grade`;
});

