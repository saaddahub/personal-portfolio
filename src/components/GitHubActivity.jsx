import { useState, useEffect, useRef } from 'react';
import { GitHubCalendar } from 'react-github-calendar';
import gsap from 'gsap';
import './GitHubActivity.css';

const GitHubActivity = () => {
  const containerRef = useRef(null);
  
  // Use saaddahub as identified
  const username = "saaddahub";
  
  useEffect(() => {
    let ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (!prefersReducedMotion) {
              gsap.fromTo(containerRef.current, 
                { opacity: 0, y: 30 }, 
                { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
              );
            }
            observer.disconnect();
          }
        });
      }, { threshold: 0.2 });
      
      if (containerRef.current) {
        // Initial state before reveal
        if (!prefersReducedMotion) {
          gsap.set(containerRef.current, { opacity: 0, y: 30 });
        }
        observer.observe(containerRef.current);
      }
      return () => observer.disconnect();
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const selectLastHalfYear = contributions => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const shownMonths = 12;
    
    return contributions.filter(activity => {
      const date = new Date(activity.date);
      const monthOfDay = date.getMonth();
      const year = date.getFullYear();

      // Show full year for better visual in portfolio
      return true;
    });
  };

  return (
    <section className="github-section" ref={containerRef} id="github-activity">
      <div className="container">
        <div className="stats-header">
          <p className="text-caption text-muted">Open Source</p>
          <h2 className="stats-headline">GitHub Activity</h2>
        </div>
        
        <div className="github-calendar-container">
          <GitHubCalendar 
            username={username} 
            colorScheme="dark"
            transformData={selectLastHalfYear}
            hideTotalCount={false}
            hideColorLegend={false}
            labels={{
              totalCount: '{{count}} contributions in the last year',
            }}
            theme={{
              light: ['#f0f0f0', '#c4edde', '#7ac7c4', '#f73859', '#384259'],
              dark: ['var(--color-bg-card)', 'rgba(201, 182, 247, 0.3)', 'rgba(201, 182, 247, 0.5)', 'rgba(201, 182, 247, 0.8)', 'var(--color-accent-pastel-a)']
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default GitHubActivity;
