export const FREELANCE_SERVICE_CATEGORIES = [
  {
    label: "Plumbing",
    value: "PLUMBER" as const,
    featured: [
      {
        name: "Emergency Plumbing",
        href: "/freelance?category=PLUMBER",
        imageSrc: "/nav/freelance/plumber-emergency.jpg"
      },
      {
        name: "Pipe Installation",
        href: "/freelance?category=PLUMBER&sort=desc",
        imageSrc: "/nav/freelance/plumber-pipe.jpg"
      },
      {
        name: "Drain Cleaning",
        href: "/freelance?category=PLUMBER",
        imageSrc: "/nav/freelance/plumber-drain.jpg"
      }
    ]
  },
  {
    label: "Electrical",
    value: "ELECTRICIAN" as const,
    featured: [
      {
        name: "Wiring Services",
        href: "/freelance?category=ELECTRICIAN",
        imageSrc: "/nav/freelance/electrician-wiring.jpg"
      },
      {
        name: "Lighting Installation",
        href: "/freelance?category=ELECTRICIAN&sort=desc",
        imageSrc: "/nav/freelance/electrician-lighting.jpg"
      },
      {
        name: "Electrical Repair",
        href: "/freelance?category=ELECTRICIAN",
        imageSrc: "/nav/freelance/electrician-repair.jpg"
      }
    ]
  },
  {
    label: "Carpentry",
    value: "CARPENTER" as const,
    featured: [
      {
        name: "Furniture Making",
        href: "/freelance?category=CARPENTER",
        imageSrc: "/nav/freelance/carpenter-furniture.jpg"
      },
      {
        name: "Woodwork Repair",
        href: "/freelance?category=CARPENTER&sort=desc",
        imageSrc: "/nav/freelance/carpenter-repair.jpg"
      },
      {
        name: "Custom Cabinetry",
        href: "/freelance?category=CARPENTER",
        imageSrc: "/nav/freelance/carpenter-cabinet.jpg"
      }
    ]
  },
  {
    label: "Mechanics",
    value: "MECHANIC" as const,
    featured: [
      {
        name: "Car Repair",
        href: "/freelance?category=MECHANIC",
        imageSrc: "/nav/freelance/mechanic-car.jpg"
      },
      {
        name: "Engine Tune-up",
        href: "/freelance?category=MECHANIC&sort=desc",
        imageSrc: "/nav/freelance/mechanic-engine.jpg"
      },
      {
        name: "Brake Service",
        href: "/freelance?category=MECHANIC",
        imageSrc: "/nav/freelance/mechanic-brake.jpg"
      }
    ]
  },
  {
    label: "Tutoring",
    value: "TUTOR" as const,
    featured: [
      {
        name: "Math Tutoring",
        href: "/freelance?category=TUTOR",
        imageSrc: "/nav/freelance/tutor-math.jpg"
      },
      {
        name: "Language Lessons",
        href: "/freelance?category=TUTOR&sort=desc",
        imageSrc: "/nav/freelance/tutor-language.jpg"
      },
      {
        name: "Science Coaching",
        href: "/freelance?category=TUTOR",
        imageSrc: "/nav/freelance/tutor-science.jpg"
      }
    ]
  },
  {
    label: "Cleaning",
    value: "CLEANER" as const,
    featured: [
      {
        name: "Home Cleaning",
        href: "/freelance?category=CLEANER",
        imageSrc: "/nav/freelance/cleaner-home.jpg"
      },
      {
        name: "Office Cleaning",
        href: "/freelance?category=CLEANER&sort=desc",
        imageSrc: "/nav/freelance/cleaner-office.jpg"
      },
      {
        name: "Deep Cleaning",
        href: "/freelance?category=CLEANER",
        imageSrc: "/nav/freelance/cleaner-deep.jpg"
      }
    ]
  },
  {
    label: "Other Services",
    value: "OTHER" as const,
    featured: [
      {
        name: "Custom Services",
        href: "/freelance?category=OTHER",
        imageSrc: "/nav/freelance/other-custom.jpg"
      },
      {
        name: "Specialized Tasks",
        href: "/freelance?category=OTHER&sort=desc",
        imageSrc: "/nav/freelance/other-specialized.jpg"
      },
      {
        name: "Miscellaneous",
        href: "/freelance?category=OTHER",
        imageSrc: "/nav/freelance/other-misc.jpg"
      }
    ]
  },
];