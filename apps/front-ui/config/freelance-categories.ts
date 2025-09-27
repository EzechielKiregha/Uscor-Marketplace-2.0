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
        imageSrc: '/category/logo_design.jpg',
      },
      {
        name: 'Web Design',
        desc: 'Modern, responsive and user-friendly websites',
        href: '/freelance/design/web',
        imageSrc: '/category/web_design.jpg',
      },
      {
        name: 'UI/UX Design',
        desc: 'Intuitive interfaces and seamless user experiences',
        href: '/freelance/design/uiux',
        imageSrc: '/category/Diferencia entre UX y UI.jpg',
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
        imageSrc: '/category/frontend.jpg',
      },
      {
        name: 'Backend Development',
        desc: 'APIs, databases, and scalable server-side apps',
        href: '/freelance/dev/backend',
        imageSrc: '/category/backend_1.jpg',
      },
      {
        name: 'Full Stack Development',
        desc: 'End-to-end application solutions with modern stacks',
        href: '/freelance/dev/fullstack',
        imageSrc: '/category/app_dev.jpg',
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
        imageSrc: '/category/Emergency Plumbing.jpg',
      },
      {
        name: 'Pipe Installation',
        desc: 'Install new piping systems for homes & businesses',
        href: '/freelance/plumber/installation',
        imageSrc: '/category/Pipe Installation.jpg',
      },
      {
        name: 'Drain Cleaning',
        desc: 'Clear clogged drains efficiently and quickly',
        href: '/freelance/plumber/drain-cleaning',
        imageSrc: '/category/Drain Cleaning.jpg',
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
        imageSrc: '/category/Wiring Services.jpg',
      },
      {
        name: 'Lighting Installation',
        desc: 'Modern lighting solutions for any space',
        href: '/freelance/electrician/lighting',
        imageSrc: '/category/Lighting Installation_2.jpg',
      },
      {
        name: 'Electrical Repairs',
        desc: 'Fix electrical faults with certified technicians',
        href: '/freelance/electrician/repair',
        imageSrc: '/category/Electrical Repairs_1.jpg',
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
        imageSrc: '/category/Custom Furniture.jpg',
      },
      {
        name: 'Woodwork Repairs',
        desc: 'Restore your old furniture to new condition',
        href: '/freelance/carpenter/repair',
        imageSrc: '/category/Woodwork Repairs_1.jpg',
      },
      {
        name: 'Cabinet Installation',
        desc: 'Beautiful cabinets for kitchens & offices',
        href: '/freelance/carpenter/cabinetry',
        imageSrc: '/category/Cabinet Installation.jpg',
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
        imageSrc: '/category/car_repair.jpg',
      },
      {
        name: 'Engine Tune-up',
        desc: 'Boost your car performance with engine service',
        href: '/freelance/mechanic/tune-up',
        imageSrc: '/category/Engine Tune-up.jpg',
      },
      {
        name: 'Brake Service',
        desc: 'Reliable brake inspection and repair',
        href: '/freelance/mechanic/brake-service',
        imageSrc: '/category/Brake Service.jpg',
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
        imageSrc: '/category/Math Tutoring.jpg',
      },
      {
        name: 'Language Lessons',
        desc: 'Master English, French, or local languages',
        href: '/freelance/tutor/language',
        imageSrc: '/category/Language Lessons.jpg',
      },
      {
        name: 'Science Coaching',
        desc: 'Learn science concepts with expert guidance',
        href: '/freelance/tutor/science',
        imageSrc: '/category/Science Coaching.jpg',
      },
    ],
  },
];