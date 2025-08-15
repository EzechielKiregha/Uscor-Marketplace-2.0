export const FREELANCE_SERVICE_CATEGORIES = [
  {
    label: 'Design & Creative',
    value: "DESIGN" as const,
    services: [
      { name: 'Logo Design', desc: 'Create a unique brand identity', href: '/freelance/design/logo', imageSrc: "/nav/freelance/plumber-emergency.jpg", },
      { name: 'Web Design', desc: 'Modern, responsive websites', href: '/freelance/design/web',imageSrc: "/nav/freelance/plumber-emergency.jpg", },
    ],
  },
  {
    label: 'Development',
    value: "DEV" as const,
    services: [
      { name: 'Frontend Dev', desc: 'React, Vue, Next.js experts', href: '/freelance/dev/frontend',imageSrc: "/nav/freelance/plumber-emergency.jpg", },
      { name: 'Backend Dev', desc: 'Node, Python, APIs', href: '/freelance/dev/backend',imageSrc: "/nav/freelance/plumber-emergency.jpg", },
    ],
  },
  {
    label: "Plumbing",
    value: "PLUMBER" as const,
    services: [
      {
        name: "Emergency Plumbing",
        href: "/freelance?category=PLUMBER",
        imageSrc: "/nav/freelance/plumber-emergency.jpg",
        desc: 'Modern, responsive websites'
      },
      {
        name: "Pipe Installation",
        href: "/freelance?category=PLUMBER&sort=desc",
        imageSrc: "/nav/freelance/plumber-pipe.jpg",
        desc: 'Modern, responsive websites'
      },
      {
        name: "Drain Cleaning",
        href: "/freelance?category=PLUMBER",
        imageSrc: "/nav/freelance/plumber-drain.jpg",
        desc: 'Modern, responsive websites'
      }
    ]
  },
  {
    label: "Electrical",
    value: "ELECTRICIAN" as const,
    services: [
      {
        name: "Wiring Services",
        href: "/freelance?category=ELECTRICIAN",
        imageSrc: "/nav/freelance/electrician-wiring.jpg",
        desc: 'Modern, responsive websites'
      },
      {
        name: "Lighting Installation",
        href: "/freelance?category=ELECTRICIAN&sort=desc",
        imageSrc: "/nav/freelance/electrician-lighting.jpg",
        desc: 'Modern, responsive websites'
      },
      {
        name: "Electrical Repair",
        href: "/freelance?category=ELECTRICIAN",
        imageSrc: "/nav/freelance/electrician-repair.jpg",
        desc: 'Modern, responsive websites'
      }
    ]
  },
  {
    label: "Carpentry",
    value: "CARPENTER" as const,
    services: [
      {
        name: "Furniture Making",
        href: "/freelance?category=CARPENTER",
        imageSrc: "/nav/freelance/carpenter-furniture.jpg",
        desc: 'Modern, responsive websites'
      },
      {
        name: "Woodwork Repair",
        href: "/freelance?category=CARPENTER&sort=desc",
        imageSrc: "/nav/freelance/carpenter-repair.jpg",
        desc: 'Modern, responsive websites'
      },
      {
        name: "Custom Cabinetry",
        href: "/freelance?category=CARPENTER",
        imageSrc: "/nav/freelance/carpenter-cabinet.jpg",
        desc: 'Modern, responsive websites'
      }
    ]
  },
  {
    label: "Mechanics",
    value: "MECHANIC" as const,
    services: [
      {
        name: "Car Repair",
        href: "/freelance?category=MECHANIC",
        imageSrc: "/nav/freelance/mechanic-car.jpg",
        desc: 'Modern, responsive websites'
      },
      {
        name: "Engine Tune-up",
        href: "/freelance?category=MECHANIC&sort=desc",
        imageSrc: "/nav/freelance/mechanic-engine.jpg",
        desc: 'Modern, responsive websites'
      },
      {
        name: "Brake Service",
        href: "/freelance?category=MECHANIC",
        imageSrc: "/nav/freelance/mechanic-brake.jpg",
        desc: 'Modern, responsive websites'
      }
    ]
  },
  {
    label: "Tutoring",
    value: "TUTOR" as const,
    services: [
      {
        name: "Math Tutoring",
        href: "/freelance?category=TUTOR",
        imageSrc: "/nav/freelance/tutor-math.jpg",
        desc: 'Modern, responsive websites'
      },
      {
        name: "Language Lessons",
        href: "/freelance?category=TUTOR&sort=desc",
        imageSrc: "/nav/freelance/tutor-language.jpg",
        desc: 'Modern, responsive websites'
      },
      {
        name: "Science Coaching",
        href: "/freelance?category=TUTOR",
        imageSrc: "/nav/freelance/tutor-science.jpg",
        desc: 'Modern, responsive websites'
      }
    ]
  },
  // {
  //   label: "Cleaning",
  //   value: "CLEANER" as const,
  //   services: [
  //     {
  //       name: "Home Cleaning",
  //       href: "/freelance?category=CLEANER",
  //       imageSrc: "/nav/freelance/cleaner-home.jpg",
  //       desc: 'Modern, responsive websites'
  //     },
  //     {
  //       name: "Office Cleaning",
  //       href: "/freelance?category=CLEANER&sort=desc",
  //       imageSrc: "/nav/freelance/cleaner-office.jpg",
  //       desc: 'Modern, responsive websites'
  //     },
  //     {
  //       name: "Deep Cleaning",
  //       href: "/freelance?category=CLEANER",
  //       imageSrc: "/nav/freelance/cleaner-deep.jpg",
  //       desc: 'Modern, responsive websites'
  //     }
  //   ]
  // },
  // {
  //   label: "Other Services",
  //   value: "OTHER" as const,
  //   services: [
  //     {
  //       name: "Custom Services",
  //       href: "/freelance?category=OTHER",
  //       imageSrc: "/nav/freelance/other-custom.jpg",
  //       desc: 'Modern, responsive websites'
  //     },
  //     {
  //       name: "Specialized Tasks",
  //       href: "/freelance?category=OTHER&sort=desc",
  //       imageSrc: "/nav/freelance/other-specialized.jpg",
  //       desc: 'Modern, responsive websites'
  //     },
  //     {
  //       name: "Miscellaneous",
  //       href: "/freelance?category=OTHER",
  //       imageSrc: "/nav/freelance/other-misc.jpg",
  //       desc: 'Modern, responsive websites'
  //     }
  //   ]
  // },
];