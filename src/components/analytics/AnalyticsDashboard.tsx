import React from 'react';
import { ProductivityAnalytics } from './ProductivityAnalytics';
import { TeamAnalytics } from './TeamAnalytics';
import { ProjectAnalytics } from './ProjectAnalytics';
import { ReportGenerator } from './ReportGenerator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-xl rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Analytics & Reporting</h1>
        <p className="text-white/80">Comprehensive insights into your team's performance</p>
      </div>

      <Tabs defaultValue="productivity" className="w-full">
        <TabsList className="grid grid-cols-4 gap-4 bg-transparent">
          <TabsTrigger
            value="productivity"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            Productivity
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
          >
            Team Performance
          </TabsTrigger>
          <TabsTrigger
            value="projects"
            className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
          >
            Project Metrics
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
          >
            Custom Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="productivity" className="mt-6">
          <ProductivityAnalytics />
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <TeamAnalytics />
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <ProjectAnalytics />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <ReportGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
