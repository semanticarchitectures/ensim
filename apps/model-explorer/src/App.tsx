import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { OrganizationsPage, OrganizationDetailPage } from "./pages/OrganizationsPage";
import { RolesPage, RoleDetailPage } from "./pages/RolesPage";
import { C2NodesPage, C2NodeDetailPage } from "./pages/C2NodesPage";
import { DoctrineProcessesPage, DoctrineProcessDetailPage } from "./pages/DoctrineProcessesPage";
import { SystemsPage, SystemDetailPage } from "./pages/SystemsPage";
import { InteractionsPage, InteractionDetailPage } from "./pages/InteractionsPage";
import { DecisionsPage, DecisionDetailPage } from "./pages/DecisionsPage";
import { MissionsPage, MissionDetailPage } from "./pages/MissionsPage";

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="organizations" element={<OrganizationsPage />} />
          <Route path="organizations/:id" element={<OrganizationDetailPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="roles/:id" element={<RoleDetailPage />} />
          <Route path="c2-nodes" element={<C2NodesPage />} />
          <Route path="c2-nodes/:id" element={<C2NodeDetailPage />} />
          <Route path="doctrine-processes" element={<DoctrineProcessesPage />} />
          <Route path="doctrine-processes/:id" element={<DoctrineProcessDetailPage />} />
          <Route path="systems" element={<SystemsPage />} />
          <Route path="systems/:id" element={<SystemDetailPage />} />
          <Route path="interactions" element={<InteractionsPage />} />
          <Route path="interactions/:id" element={<InteractionDetailPage />} />
          <Route path="decisions" element={<DecisionsPage />} />
          <Route path="decisions/:id" element={<DecisionDetailPage />} />
          <Route path="missions" element={<MissionsPage />} />
          <Route path="missions/:id" element={<MissionDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
