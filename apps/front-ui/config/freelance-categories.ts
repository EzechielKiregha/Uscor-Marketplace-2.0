import {
  Wrench,
  Plug,
  Car,
  GraduationCap,
  Brush,
  Layout,
} from "lucide-react";

// ✅ Freelance Service Categories with better structure and icons
export const FREELANCE_SERVICE_CATEGORIES = [
  {
    label: 'Design & Creative',
    value: "DESIGN" as const,
    icon: Brush,
    services: [
      {
        name: 'Logo Design',
        desc: 'Create unique brand identities and memorable logos',
        href: '/freelance/design/logo',
        imageSrc: 'https://images.unsplash.com/photo-1585776245991-5c04e0e09fbd',
      },
      {
        name: 'Web Design',
        desc: 'Modern, responsive and user-friendly websites',
        href: '/freelance/design/web',
        imageSrc: 'https://images.unsplash.com/photo-1581276879432-15a39f1b41c1',
      },
      {
        name: 'UI/UX Design',
        desc: 'Intuitive interfaces and seamless user experiences',
        href: '/freelance/design/uiux',
        imageSrc: 'https://images.unsplash.com/photo-1611926653459-0ecb125d2f47',
      },
    ],
  },
  {
    label: 'Development',
    value: "DEV" as const,
    icon: Layout,
    services: [
      {
        name: 'Frontend Development',
        desc: 'Build responsive interfaces with React, Vue, or Next.js',
        href: '/freelance/dev/frontend',
        imageSrc: 'https://images.unsplash.com/photo-1517433456452-f9633a875f6f',
      },
      {
        name: 'Backend Development',
        desc: 'APIs, databases, and scalable server-side apps',
        href: '/freelance/dev/backend',
        imageSrc: 'https://images.unsplash.com/photo-1605902711622-cfb43c4437d6',
      },
      {
        name: 'Full Stack Development',
        desc: 'End-to-end application solutions with modern stacks',
        href: '/freelance/dev/fullstack',
        imageSrc: 'https://images.unsplash.com/photo-1551033406-611cf9a28f55',
      },
    ],
  },
  {
    label: 'Plumbing',
    value: "PLUMBER" as const,
    icon: Wrench,
    services: [
      {
        name: 'Emergency Plumbing',
        desc: '24/7 quick plumbing fixes for urgent issues',
        href: '/freelance/plumber/emergency',
        imageSrc: 'https://images.unsplash.com/photo-1578305695948-8ab3f004d7b6',
      },
      {
        name: 'Pipe Installation',
        desc: 'Install new piping systems for homes & businesses',
        href: '/freelance/plumber/installation',
        imageSrc: 'https://images.unsplash.com/photo-1587202372775-989dc8be7db3',
      },
      {
        name: 'Drain Cleaning',
        desc: 'Clear clogged drains efficiently and quickly',
        href: '/freelance/plumber/drain-cleaning',
        imageSrc: 'https://images.unsplash.com/photo-1623872829087-27024b8de3ea',
      },
    ],
  },
  {
    label: 'Electrical',
    value: "ELECTRICIAN" as const,
    icon: Plug,
    services: [
      {
        name: 'Wiring Services',
        desc: 'Safe and reliable wiring for homes & businesses',
        href: '/freelance/electrician/wiring',
        imageSrc: 'https://images.unsplash.com/photo-1581090700227-4c4f50b0f3a1',
      },
      {
        name: 'Lighting Installation',
        desc: 'Modern lighting solutions for any space',
        href: '/freelance/electrician/lighting',
        imageSrc: 'https://images.unsplash.com/photo-1532318065232-3a015f141c78',
      },
      {
        name: 'Electrical Repairs',
        desc: 'Fix electrical faults with certified technicians',
        href: '/freelance/electrician/repair',
        imageSrc: 'https://images.unsplash.com/photo-1521747116042-5a810fda9664',
      },
    ],
  },
  {
    label: 'Carpentry',
    value: "CARPENTER" as const,
    icon: Plug,
    services: [
      {
        name: 'Custom Furniture',
        desc: 'Handcrafted furniture tailored to your needs',
        href: '/freelance/carpenter/furniture',
        imageSrc: 'https://images.unsplash.com/photo-1578305695948-8ab3f004d7b6',
      },
      {
        name: 'Woodwork Repairs',
        desc: 'Restore your old furniture to new condition',
        href: '/freelance/carpenter/repair',
        imageSrc: 'https://images.unsplash.com/photo-1623872829087-27024b8de3ea',
      },
      {
        name: 'Cabinet Installation',
        desc: 'Beautiful cabinets for kitchens & offices',
        href: '/freelance/carpenter/cabinetry',
        imageSrc: 'https://images.unsplash.com/photo-1605902711622-cfb43c4437d6',
      },
    ],
  },
  {
    label: 'Mechanics',
    value: "MECHANIC" as const,
    icon: Car,
    services: [
      {
        name: 'Car Repair',
        desc: 'Expert auto repair for all makes and models',
        href: '/freelance/mechanic/car-repair',
        imageSrc: 'https://images.unsplash.com/photo-1521790797524-b2497295b8a0',
      },
      {
        name: 'Engine Tune-up',
        desc: 'Boost your car performance with engine service',
        href: '/freelance/mechanic/tune-up',
        imageSrc: 'https://images.unsplash.com/photo-1603297631047-221fa0fcbfaa',
      },
      {
        name: 'Brake Service',
        desc: 'Reliable brake inspection and repair',
        href: '/freelance/mechanic/brake-service',
        imageSrc: 'https://images.unsplash.com/photo-1600517547339-6d18d77e55e7',
      },
    ],
  },
  {
    label: 'Tutoring',
    value: "TUTOR" as const,
    icon: GraduationCap,
    services: [
      {
        name: 'Math Tutoring',
        desc: 'Personalized math lessons for all levels',
        href: '/freelance/tutor/math',
        imageSrc: 'https://images.unsplash.com/photo-1603570417029-3ebf66ecb5e4',
      },
      {
        name: 'Language Lessons',
        desc: 'Master English, French, or local languages',
        href: '/freelance/tutor/language',
        imageSrc: 'https://images.unsplash.com/photo-1585776245991-5c04e0e09fbd',
      },
      {
        name: 'Science Coaching',
        desc: 'Learn science concepts with expert guidance',
        href: '/freelance/tutor/science',
        imageSrc: 'https://images.unsplash.com/photo-1623872829087-27024b8de3ea',
      },
    ],
  },
];