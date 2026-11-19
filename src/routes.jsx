import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Loading } from '@carbon/react';

const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const ProblemPage = lazy(() => import('./pages/ProblemPage.jsx'));
const SolutionPage = lazy(() => import('./pages/SolutionPage.jsx'));
const ResultsPage = lazy(() => import('./pages/ResultsPage.jsx'));
const ArchitecturePage = lazy(() => import('./pages/ArchitecturePage.jsx'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading withOverlay={false} description="Loading page" />}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/problem" element={<ProblemPage />} />
        <Route path="/solution" element={<SolutionPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/architecture" element={<ArchitecturePage />} />
        <Route path="*" element={<DashboardPage />} />
      </Routes>
    </Suspense>
  );
}
