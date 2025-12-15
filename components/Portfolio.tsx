
import React, { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Eye, Layers, ArrowRight } from 'lucide-react';
import { SectionTitle } from './SectionTitle';
import { Project, ViewType } from '../types';
import { ProjectModal } from './ProjectModal';
import { SEO } from './SEO';
import { OptimizedImage } from './OptimizedImage';
import { useContent } from '../contexts/ContentContext';

interface PortfolioProps {
  onOpenChat: () => void;
  onNavigate: (view: ViewType) => void;
}

// Memoized Card Component to prevent list re-renders
const ProjectCard = memo(({ 
    project, 
    index, 
    onClick, 
    className = "" 
}: { 
    project: Project; 
    index: number; 
    onClick: () => void;
    className?: string;
}) => {
    const isInternalDemo = project.demoUrl.startsWith('#internal:');

    return (
        <motion.div
            layoutId={`project-${project.id}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }} // Margin adjusted for better triggering
            transition={{ duration: 0.4, delay: index * 0.05 }} // Faster transition
            onClick={onClick}
            className={`group relative overflow-hidden rounded-[2rem] cursor-pointer bg-gray-900 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-primary-900/10 transition-all duration-300 ${className}`}
        >
            {/* Image Layer */}
            <div className="absolute inset-0 w-full h-full">
                <OptimizedImage
                    src={project.image} 
                    alt={project.title}
                    priority={index < 2}
                    className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-60 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-90 transition-opacity duration-300 z-10" />
            </div>

            {/* Content Layer */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end items-start z-20">
                
                {/* Floating Category Badge (Top Left) */}
                <div className="absolute top-8 left-8">
                     <span className="px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-white tracking-wide uppercase">
                        {project.category}
                     </span>
                </div>

                {/* Arrow Icon (Top Right) */}
                <div className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
                    {isInternalDemo ? <Eye size={18} /> : <ArrowUpRight size={18} />}
                </div>

                {/* Text Content */}
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 w-full">
                    <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-2 leading-tight">
                        {project.title}
                    </h3>
                    
                    {/* CSS-only transition for height/opacity is more performant than JS animation */}
                    <div className="max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100 transition-all duration-300 ease-in-out overflow-hidden">
                        <p className="text-gray-300 text-sm leading-relaxed mb-4 max-w-lg pt-2">
                            {project.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 pb-2">
                            {project.tags.map((tag) => (
                                <span key={tag} className="text-[10px] font-mono text-gray-400 border border-gray-700 rounded px-2 py-0.5">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

export const Portfolio: React.FC<PortfolioProps> = ({ onOpenChat, onNavigate }) => {
  const { content } = useContent();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const projects = content.projects;
  const githubUrl = content.contact.GITHUB_URL;

  const handleOpenDemo = useCallback((url: string) => {
    if (url.startsWith('#internal:')) {
        const view = url.replace('#internal:', '') as ViewType;
        onNavigate(view);
    } else {
        window.open(url, '_blank');
    }
  }, [onNavigate]);

  // Memoize handlers to keep props stable for memoized children
  const handleProjectClick = useCallback((project: Project) => {
      setSelectedProject(project);
  }, []);

  const handleCloseModal = useCallback(() => {
      setSelectedProject(null);
  }, []);

  return (
    <section id="portfolio" className="py-24 md:py-32 bg-white relative overflow-hidden">
        <SEO 
            title="Portfólio de Sites | Projetos de Alta Performance"
            description="Veja exemplos reais de sites otimizados, landing pages e aplicações web modernas desenvolvidas com React e Next.js."
            keywords={["Portfólio Frontend", "Exemplos de Landing Page", "Sites React", "Web Design Portfolio"]}
            breadcrumbs={[{ name: "Home", item: "/" }, { name: "Portfólio", item: "/#portfolio" }]}
        />

        {/* Removed heavy blur bg element for performance */}
        
        <div className="container mx-auto px-4 md:px-8 relative z-10 max-w-7xl">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                <div>
                    <SectionTitle 
                        title="Projetos Recentes" 
                        subtitle="Uma seleção de interfaces desenvolvidas com foco em performance, estética e conversão."
                        alignment="left"
                    />
                </div>
                
                <div className="hidden md:block mb-24">
                     <button 
                        onClick={() => window.open(githubUrl, '_blank')}
                        className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors text-sm font-medium group"
                     >
                        <Layers size={16} />
                        <span>Ver repositórios</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                     </button>
                </div>
            </div>

            {/* DYNAMIC GRID LAYOUT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-[420px]">
                
                {projects.map((proj, idx) => (
                    <ProjectCard 
                        key={proj.id}
                        project={proj} 
                        index={idx} 
                        onClick={() => handleProjectClick(proj)}
                        className="md:col-span-1"
                    />
                ))}

                {/* CTA Card - Adapts size based on project count */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={`rounded-[2rem] bg-primary-600 p-10 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group cursor-pointer ${projects.length % 2 === 0 ? 'md:col-span-2' : 'md:col-span-1'}`}
                    onClick={onOpenChat}
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-900/20 rounded-full blur-2xl transform -translate-x-1/4 translate-y-1/4" />

                    <div className="relative z-10 flex-1 mb-8 md:mb-0">
                        <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-white mb-4 uppercase tracking-wider backdrop-blur-sm">
                            Comece Hoje
                        </span>
                        <h3 className="text-3xl md:text-4xl font-display font-bold text-white mb-3">
                            Tem uma ideia incrível?
                        </h3>
                        <p className="text-primary-100 text-lg max-w-md leading-relaxed">
                            Não deixe seu projeto apenas no papel. Vamos construir algo memorável juntos.
                        </p>
                    </div>

                    <div className="relative z-10">
                        <div className="w-16 h-16 rounded-full bg-white text-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <ArrowRight size={24} />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>

        <ProjectModal 
          project={selectedProject} 
          isOpen={!!selectedProject} 
          onClose={handleCloseModal} 
          onOpenDemo={handleOpenDemo}
        />
    </section>
  );
};
