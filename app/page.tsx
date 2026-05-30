"use client";

import { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  LayoutDashboard,
  MapPin,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  DollarSign,
  Building2,
  Globe,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Project } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/utils";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRegion, setFilterRegion] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from("dpwh_projects")
        .select("*")
        .limit(5000); // Limit for performance

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }

  // Filter projects based on search and filters
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.description?.toLowerCase().includes(search.toLowerCase()) ||
        project.contract_id?.toLowerCase().includes(search.toLowerCase()) ||
        project.province?.toLowerCase().includes(search.toLowerCase()) ||
        project.contractor?.toLowerCase().includes(search.toLowerCase());

      const matchesRegion =
        filterRegion === "all" || project.region === filterRegion;
      const matchesStatus =
        filterStatus === "all" || project.status === filterStatus;

      return matchesSearch && matchesRegion && matchesStatus;
    });
  }, [projects, search, filterRegion, filterStatus]);

  // Calculate summary stats
  const stats = useMemo(() => {
    const total = filteredProjects.length;
    const totalBudget = filteredProjects.reduce(
      (sum, p) => sum + (p.budget || 0),
      0
    );
    const completed = filteredProjects.filter(
      (p) => p.status === "Completed"
    ).length;
    const ongoing = filteredProjects.filter(
      (p) => p.status === "Ongoing" || p.status === "On-Going"
    ).length;
    const avgProgress =
      total > 0
        ? filteredProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / total
        : 0;

    return { total, totalBudget, completed, ongoing, avgProgress };
  }, [filteredProjects]);

  // Prepare data for charts
  const statusData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    filteredProjects.forEach((p) => {
      if (p.status) {
        statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
      }
    });
    return Object.entries(statusCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [filteredProjects]);

  const regionData = useMemo(() => {
    const regionCounts: Record<string, number> = {};
    filteredProjects.forEach((p) => {
      if (p.region) {
        regionCounts[p.region] = (regionCounts[p.region] || 0) + 1;
      }
    });
    return Object.entries(regionCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredProjects]);

  const uniqueRegions = useMemo(() => {
    const regions = new Set<string>();
    projects.forEach((p) => {
      if (p.region) regions.add(p.region);
    });
    return Array.from(regions).sort();
  }, [projects]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    projects.forEach((p) => {
      if (p.status) statuses.add(p.status);
    });
    return Array.from(statuses).sort();
  }, [projects]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  DPWH Infrastructure Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  Transparency Portal Data Visualization
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://transparency.dpwh.gov.ph/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Globe className="h-4 w-4" />
                DPWH Portal
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Projects */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <LayoutDashboard className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Projects
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(stats.total)}
                </p>
              </div>
            </div>
          </div>

          {/* Total Budget */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(stats.totalBudget)}
                </p>
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-full">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(stats.completed)}
                </p>
              </div>
            </div>
          </div>

          {/* Ongoing */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Ongoing</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(stats.ongoing)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search projects, contractors, provinces..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Region Filter */}
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Region
              </label>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Regions</option>
                {uniqueRegions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-64">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Projects by Region */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Top 10 Regions by Number of Projects
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Projects by Status */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Project Status Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Projects Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Projects ({formatNumber(filteredProjects.length)})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contract ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProjects.slice(0, 100).map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600">
                      {project.contract_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {project.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {project.province && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {project.province}
                        </div>
                      )}
                      {project.region && (
                        <div className="text-xs text-gray-400">
                          {project.region}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          project.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : project.status === "Ongoing" ||
                              project.status === "On-Going"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(project.budget)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            (project.progress || 0) >= 75
                              ? "bg-green-500"
                              : (project.progress || 0) >= 50
                              ? "bg-blue-500"
                              : "bg-amber-500"
                          }`}
                          style={{ width: `${Math.min(project.progress || 0, 100)}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {(project.progress || 0).toFixed(1)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredProjects.length > 100 && (
            <div className="px-6 py-4 border-t border-gray-200 text-sm text-gray-500">
              Showing first 100 of {formatNumber(filteredProjects.length)}{" "}
              projects
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
