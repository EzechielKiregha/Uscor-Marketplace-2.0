export const PRODUCT_CATEGORIES = [
    {
      label: "Meubles & Arts",
      value: "meubles_salon" as const,
      featured: [
        {
          name: "Sélection du Moment",
          href: "/marketplace/products?category=meubles_salon",
          imageSrc: "/nav/art/Vibrant Art Gallery.jpg"
        },
        {
          name: "Canapé Confort",
          href: "/marketplace/products?category=meubles_salon&sort=desc",
          imageSrc: "/nav/salon/Vintage yellow sofa.jpg"
        },
        {
          name: "Table Basse Élégante",
          href: "/marketplace/products?category=meubles_salon",
          imageSrc: "/nav/salon/table basse elegante.jpg"
        }
      ]
    },
    {
      label: "Meubles de Bureau",
      value: "meubles_bureau" as const,
      featured: [
        {
          name: "Nouveautés",
          href: "/marketplace/products?category=meubles_bureau&sort=desc",
          imageSrc: "/nav/bureau/Elegant Office Chair.jpg"
        },
        {
          name: "Chaise Ergonomique",
          href: "/marketplace/products?category=meubles_bureau",
          imageSrc: "/nav/bureau/office.jpeg"
        },
        {
          name: "Bureau Moderne",
          href: "/marketplace/products?category=meubles_bureau",
          imageSrc: "/nav/bureau/Minimalist Office Space.jpg"
        }
      ]
    },
    {
        label: "Outils",
        value: "outils"as const,
        featured: [
          {
            name: "Plus favories",
            href: "/marketplace/products?category=outils",
            imageSrc: "/nav/icons/picks.jpg"
          },
          {
            name: "Nouveaux Outils",
            href: "/marketplace/products?category=outils&sort=desc",
            imageSrc: "/nav/icons/new.jpg"
          },
          {
            name: "Machine de rabotage",
            href: "/marketplace/products?category=outils",
            imageSrc: "/nav/icons/bestsellers.jpg"
          }
        ]
      }
  ];
  