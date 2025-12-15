
import { Project } from './types';

export const PROJECTS_DATA: Project[] = [
  {
    id: 'hce-esquadrias',
    title: 'HCE Esquadrias',
    category: 'Indústria / Corporativo',
    description: 'Site institucional robusto para uma das maiores indústrias de esquadrias. Foco em catálogo de obras, SEO técnico e performance de carregamento.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000&auto=format&fit=crop',
    tags: ['React', 'Tailwind CSS', 'SEO', 'Catálogo'],
    demoUrl: 'https://www.hceesquadrias.com.br',
    liveUrl: 'https://www.hceesquadrias.com.br',
    featured: true,
    challenge: "O cliente possuía um site antigo em Wordpress que demorava 8 segundos para carregar, penalizando o SEO e perdendo leads qualificados.",
    solution: "Desenvolvemos uma Single Page Application (SPA) em React com geração estática de catálogo. Implementamos Lazy Loading agressivo de imagens e compressão WebP.",
    result: "Tempo de carregamento reduzido para 0.9s (Google PageSpeed 98/100). Aumento de 40% nos pedidos de orçamento no primeiro mês após o lançamento."
  }
];
