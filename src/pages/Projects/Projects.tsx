import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Filter, ArrowUpRight, FolderGit2 } from 'lucide-react';
import { studioService } from '../../services';
import { Project, ProjectStatus } from '../../types';
import { Badge, Button, Tabs, Input, ProgressBar, EmptyState } from '../../components/ui';
import './Projects.css';

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [isLoading, setIsLoading] = useState(true);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const data = await studioService.getProjects();
      setProjects(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    const handleUpdate = () => loadProjects();
    window.addEventListener('studio:data-updated', handleUpdate);
    return () => window.removeEventListener('studio:data-updated', handleUpdate);
  }, []);

  const filterProjects = () => {
    return projects.filter((p) => {
      const matchesTab = 
        activeTab === 'all' ? true :
        activeTab === 'in_progress' ? p.status === 'in_progress' :
        activeTab === 'in_review' ? p.status === 'in_review' :
        activeTab === 'completed' ? p.status === 'completed' : true;

      const matchesSearch = 
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  };

  const filteredProjects = filterProjects();

  const getStatusCount = (status?: ProjectStatus) => {
    if (!status) return projects.length;
    return projects.filter((p) => p.status === status).length;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="studio-projects-page studio-animate-fade-in">
      {/* Header */}
      <section className="studio-page-header">
        <div>
          <span className="studio-section-label">COMMISSIONS & REPERTOIRE</span>
          <h1 className="studio-page-title">Works & Projects</h1>
          <p className="studio-page-desc">
            Independent monographs, physical packaging dies, typography systems, and identity commissions.
          </p>
        </div>

        <div className="studio-page-header__actions">
          <Button 
            variant="primary" 
            iconLeft={<Plus size={14} />}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('studio:open-new-project-modal'));
            }}
          >
            Commission Work
          </Button>
        </div>
      </section>

      {/* Filter / Tabs Bar */}
      <div className="studio-controls-bar">
        <Tabs
          tabs={[
            { id: 'all', label: 'All Works', count: getStatusCount() },
            { id: 'in_progress', label: 'In Production', count: getStatusCount('in_progress') },
            { id: 'in_review', label: 'Client Review', count: getStatusCount('in_review') },
            { id: 'completed', label: 'Archive / Delivered', count: getStatusCount('completed') }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        <div className="studio-projects__search">
          <Input 
            placeholder="Search by client, title, category or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            iconLeft={<Search size={14} />}
          />
        </div>
      </div>

      {/* Projects Grid / States */}
      {isLoading ? (
        <div className="studio-loading-state">
          <div className="studio-spinner" />
          <span>LOADING SELECTED WORKS // PORTFOLIO</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          icon={<FolderGit2 size={22} />}
          eyebrow="// REPERTOIRE RECORD EMPTY"
          title="No Commissions Found"
          description={
            searchQuery || activeTab !== 'all'
              ? 'No project specimens match your active search terms or category filter. Try clearing filters.'
              : 'No design commissions have been registered in the works directory yet.'
          }
          action={
            searchQuery || activeTab !== 'all'
              ? {
                  label: 'Clear Filters',
                  variant: 'secondary',
                  onClick: () => {
                    setSearchQuery('');
                    setActiveTab('all');
                  }
                }
              : {
                  label: 'Commission Work',
                  variant: 'primary',
                  onClick: () => window.dispatchEvent(new CustomEvent('studio:open-new-project-modal'))
                }
          }
        />
      ) : (
        <div className="studio-projects-grid">
          {filteredProjects.map((project, index) => (
            <article 
              key={project.id} 
              className={`studio-work-card studio-card-interactive studio-animate-fade-in studio-stagger-${Math.min(index + 1, 6)}`}
            >
              <div className="studio-work-card__top">
              <div className="studio-work-card__client-group">
                <span className="mono studio-work-card__code">{project.code}</span>
                <span className="studio-work-card__dot-sep">·</span>
                <span className="studio-work-card__client">{project.clientName}</span>
              </div>
              <div className="studio-work-card__tags">
                <Badge variant={project.category === 'Packaging & Print' ? 'vermilion' : 'sage'} size="sm">
                  {project.category}
                </Badge>
                <Badge 
                  variant={project.status === 'in_review' ? 'review' : project.status === 'completed' ? 'approved' : 'draft'}
                  size="sm"
                  dot
                >
                  {project.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            <div className="studio-work-card__visual">
              {project.imageUrl ? (
                <img 
                  src={project.imageUrl} 
                  alt={project.title} 
                  className="studio-work-card__img" 
                  loading="lazy" 
                />
              ) : (
                <div className="studio-work-card__placeholder">
                  <span className="mono">{project.code}</span>
                </div>
              )}
              <div className="studio-work-card__corner studio-work-card__corner--tl">⌖ 1:1</div>
              <div className="studio-work-card__corner studio-work-card__corner--tr">CMYK+2</div>
              {project.imageStamp && (
                <span className="studio-work-card__stamp-tag">
                  {project.imageStamp}
                </span>
              )}
            </div>

            <div className="studio-work-card__body">
              <h2 className="studio-work-card__title">
                <Link to={`/projects/${project.id}`}>{project.title}</Link>
              </h2>
              <p className="studio-work-card__summary">{project.summary}</p>
            </div>

            {/* Spec & Animated Progress Bar */}
            <div className="studio-work-card__progress">
              <div className="studio-work-card__progress-info">
                <span>Progress</span>
                <span className="mono">{project.progressPercent}%</span>
              </div>
              <ProgressBar 
                percent={project.progressPercent}
                variant="ink"
                delay={200 + index * 80}
                height={5}
              />
            </div>

            {/* Metadata Footer */}
            <div className="studio-work-card__footer">
              <div className="studio-work-card__meta-cell">
                <span className="studio-work-card__meta-label">LEAD</span>
                <span className="studio-work-card__meta-val">{project.leadDesigner}</span>
              </div>
              <div className="studio-work-card__meta-cell">
                <span className="studio-work-card__meta-label">DELIVERABLES</span>
                <span className="studio-work-card__meta-val mono">{project.deliverablesCount} Specs</span>
              </div>
              <div className="studio-work-card__meta-cell">
                <span className="studio-work-card__meta-label">BUDGET</span>
                <span className="studio-work-card__meta-val mono">{formatCurrency(project.budgetTotal)}</span>
              </div>
              <Link to={`/projects/${project.id}`} className="studio-work-card__link">
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </article>
        ))}
      </div>
      )}
    </div>
  );
};
