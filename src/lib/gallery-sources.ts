export interface GalleryItem {
  id: string | number;
  imageUrl: string;
  caption: string | null;
  altText: string | null;
  category?: "court" | "corporate" | "casual" | "admin" | "all";
  featured?: boolean;
}

export const PUBLIC_GALLERY_IMAGES: GalleryItem[] = [
  // Court Registry Session
  {
    id: "public-court-1",
    imageUrl: "/court/_DSC0716.JPG",
    caption: "The Registry & Legal Union — Official Sign of Forever",
    altText: "Olasubulumi & Dare at the Court Registry",
    category: "court",
    featured: true,
  },
  {
    id: "public-court-2",
    imageUrl: "/court/_DSC0649.JPG.jpeg",
    caption: "Sealed with a Promise — Joy in the Presence of Witnesses",
    altText: "The couple celebrating their court registry union",
    category: "court",
  },
  {
    id: "public-court-3",
    imageUrl: "/court/IMG_0671.JPG.jpeg",
    caption: "Radiant Smiles & Lifelong Commitment",
    altText: "Court registry joy and laughter",
    category: "court",
  },
  {
    id: "public-court-4",
    imageUrl: "/court/IMG_0698.JPG.jpeg",
    caption: "Signed, Sealed & Celebrated",
    altText: "The couple at the court registry ceremony",
    category: "court",
  },
  {
    id: "public-court-5",
    imageUrl: "/court/IMG_0700.JPG.jpeg",
    caption: "A New Chapter Begins — Legally One",
    altText: "Celebrating the official court union",
    category: "court",
  },
  {
    id: "public-court-6",
    imageUrl: "/court/IMG_0701.JPG.jpeg",
    caption: "A New Chapter Begins — Legally One",
    altText: "Celebrating the official court union",
    category: "court",
  },

  // Corporate & Editorial Session
  {
    id: "public-corp-1",
    imageUrl: "/corporate/_NZ55155-Edit.jpg",
    caption: "Royal Majesty — Poise, Devotion & Cultural Elegance",
    altText: "High editorial portrait of Olasubulumi & Dare",
    category: "corporate",
    featured: true,
  },
  {
    id: "public-corp-2",
    imageUrl: "/corporate/_NZ55161-Edit.jpg",
    caption: "Two Souls in Harmony — The Promise of Tomorrow",
    altText: "Olasubulumi and Dare in evening elegance",
    category: "corporate",
    featured: true,
  },
  {
    id: "public-corp-3",
    imageUrl: "/corporate/_NZ55084-Edit.jpg",
    caption: "Timeless Grace & Shared Affection",
    altText: "Corporate pre-wedding photoshoot portrait",
    category: "corporate",
  },
  {
    id: "public-corp-4",
    imageUrl: "/corporate/_NZ55107-Edit.jpg",
    caption: "A Look that Speaks a Thousand Promises",
    altText: "Intimate couple gaze",
    category: "corporate",
  },
  {
    id: "public-corp-5",
    imageUrl: "/corporate/_NZ55121-Edit.jpg",
    caption: "Strength, Beauty & Sacred Fellowship",
    altText: "Portrait in dark burgundy setting",
    category: "corporate",
  },
  {
    id: "public-corp-6",
    imageUrl: "/corporate/_NZ55164-Edit.jpg",
    caption: "Modern Romance with Traditional Roots",
    altText: "Couple posing together in evening wear",
    category: "corporate",
  },
  {
    id: "public-corp-7",
    imageUrl: "/corporate/_NZ55169-Edit.jpg",
    caption: "Hand in Hand Across Every Season",
    altText: "The couple holding hands lovingly",
    category: "corporate",
  },
  {
    id: "public-corp-8",
    imageUrl: "/corporate/_NZ55180-Edit.jpg",
    caption: "Pure Happiness & Shared Laughter",
    altText: "Couple laughing with genuine joy",
    category: "corporate",
  },
  {
    id: "public-corp-9",
    imageUrl: "/corporate/_NZ55191-Edit.jpg",
    caption: "Gentle Touch, Unshakeable Devotion",
    altText: "Tender moment between the couple",
    category: "corporate",
  },
  {
    id: "public-corp-10",
    imageUrl: "/corporate/_NZ55196-Edit.jpg",
    caption: "The Journey of a Lifetime Begins",
    altText: "Elegant side portrait",
    category: "corporate",
  },
  {
    id: "public-corp-11",
    imageUrl: "/corporate/_NZ55207-Edit.jpg",
    caption: "Every Step Guided by Faith and Love",
    altText: "Pre-wedding studio portrait",
    category: "corporate",
  },
  {
    id: "public-corp-12",
    imageUrl: "/corporate/_NZ55232-Edit.jpg",
    caption: "A Love That Inspires Us Every Day",
    altText: "Celebratory formal portrait",
    category: "corporate",
  },
  {
    id: "public-corp-13",
    imageUrl: "/corporate/0cc325bd-334e-4ce7-9b6b-3cf96135c89d.jpg",
    caption: "A Love That Inspires Us Every Day",
    altText: "Celebratory formal portrait",
    category: "corporate",
  },
  {
    id: "public-corp-14",
    imageUrl: "/corporate/2c81d48e-72fd-4ed1-a1ee-48e16f3ad18d.jpg",
    caption: "A Love That Inspires Us Every Day",
    altText: "Celebratory formal portrait",
    category: "corporate",
  },
  {
    id: "public-corp-15",
    imageUrl: "/corporate/abc.jpg",
    caption: "A Love That Inspires Us Every Day",
    altText: "Celebratory formal portrait",
    category: "corporate",
  },
  {
    id: "public-corp-16",
    imageUrl: "/corporate/b535cc54-ca22-4ac8-991c-efcf602433d5.jpg",
    caption: "A Love That Inspires Us Every Day",
    altText: "Celebratory formal portrait",
    category: "corporate",
  },

  // Casual & Intimate Session
  {
    id: "public-cas-1",
    imageUrl: "/casual/IMG_9657.jpg.jpeg",
    caption: "Our Natural Haven — Love in Its Purest Warmth",
    altText: "Casual intimate embrace",
    category: "casual",
    featured: true,
  },
  {
    id: "public-cas-2",
    imageUrl: "/casual/IMG_9679.jpg.jpeg",
    caption: "Unfiltered Connection & Sweet Whispers",
    altText: "Couple whispering and smiling together",
    category: "casual",
  },
  {
    id: "public-cas-3",
    imageUrl: "/casual/IMG_9659.jpg.jpeg",
    caption: "Unfiltered Connection & Sweet Whispers",
    altText: "Couple whispering and smiling together",
    category: "casual",
  },
  {
    id: "public-cas-4",
    imageUrl: "/casual/IMG_9610.jpg.jpeg",
    caption: "From Secondary School Classmates to Forever",
    altText: "Relaxed couple outdoor moment",
    category: "casual",
  },
  {
    id: "public-cas-5",
    imageUrl: "/casual/IMG_9643.jpg.jpeg",
    caption: "Where Friendship Blossomed into Eternity",
    altText: "Casual lifestyle pre-wedding photo",
    category: "casual",
  },
  {
    id: "public-cas-6",
    imageUrl: "/casual/IMG_9626.jpg.jpeg",
    caption: "Simply Us — Real, Joyful & Deeply Blessed",
    altText: "Joyful natural portrait",
    category: "casual",
  },
  {
    id: "public-cas-7",
    imageUrl: "/casual/IMG_9639.jpg.jpeg",
    caption: "Everyday Love, Extraordinary Bond",
    altText: "Candid casual moment between the couple",
    category: "casual",
  },
];

/**
 * Combines project public-folder images with database admin-uploaded images,
 * ensuring no duplicates (by normalized imageUrl).
 */
export function getMergedGallery(
  adminImages: Array<{
    id: number;
    imageUrl: string;
    caption: string | null;
    altText: string | null;
  }> = []
): GalleryItem[] {
  const seenUrls = new Set<string>();
  const merged: GalleryItem[] = [];

  // Helper to normalize image URL for comparison
  const normalize = (url: string) =>
    url.trim().toLowerCase().replace(/^\/+/, "/");

  // First, add admin-uploaded images (giving them prime prominence)
  for (const item of adminImages) {
    const key = normalize(item.imageUrl);
    if (!seenUrls.has(key)) {
      seenUrls.add(key);
      merged.push({
        id: `admin-${item.id}`,
        imageUrl: item.imageUrl,
        caption: item.caption,
        altText: item.altText,
        category: "admin",
        featured: true,
      });
    }
  }

  // Then add all public folder images
  for (const item of PUBLIC_GALLERY_IMAGES) {
    const key = normalize(item.imageUrl);
    if (!seenUrls.has(key)) {
      seenUrls.add(key);
      merged.push(item);
    }
  }

  return merged;
}
