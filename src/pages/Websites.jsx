import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import Loading from "../components/Loading";

import {
  getProjects,
  createProject,
  deleteProject,
} from "../api/projectApi";

export default function Websites() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  // =====================================================
  // LOAD PROJECTS
  // =====================================================

  async function loadProjects() {
    try {
      setLoading(true);
      setError("");

      const response = await getProjects();

      setProjects(response.projects || []);
    } catch (err) {
      console.error("Load projects error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load your websites."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  // =====================================================
  // CREATE WEBSITE
  // =====================================================

  async function handleCreate(e) {
    e.preventDefault();

    setError("");

    const name = projectName.trim();
    const url = websiteUrl.trim();

    if (!name) {
      setError("Please enter website name.");
      return;
    }

    if (!url) {
      setError("Please enter website URL.");
      return;
    }

    try {
      setSaving(true);

      await createProject({
        project_name: name,
        website_url: url,
      });

      setProjectName("");
      setWebsiteUrl("");

      setShowModal(false);

      await loadProjects();
    } catch (err) {
      console.error("Create project error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to create website."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // DELETE WEBSITE
  // =====================================================

  async function handleDelete(project) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.project_name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteProject(project.id);

      await loadProjects();
    } catch (err) {
      console.error("Delete project error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete website."
      );
    }
  }

  // =====================================================
  // OPEN WEBSITE DASHBOARD
  // =====================================================

  function openDashboard(projectId) {
    navigate(`/projects/${projectId}/dashboard`);
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <Layout>
        <Loading text="Loading your websites..." />
      </Layout>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <Layout>
      <div className="page-header">
        <div>
          <small>WEBSITE MANAGEMENT</small>

          <h1>My Websites</h1>

          <p>
            Manage all websites connected to your RKVeda SEO account.
          </p>
        </div>

        <button
          className="primary"
          type="button"
          onClick={() => {
            setError("");
            setShowModal(true);
          }}
        >
          + Add Website
        </button>
      </div>

      {error && (
        <div className="alert">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <section className="panel empty-state">
          <div className="empty-icon">🌐</div>

          <h2>No websites yet</h2>

          <p>
            Add your first website to start tracking SEO performance.
          </p>

          <button
            className="primary"
            type="button"
            onClick={() => setShowModal(true)}
          >
            + Add Website
          </button>
        </section>
      ) : (
        <div className="website-grid">
          {projects.map((project) => (
            <article
              className="website-card"
              key={project.id}
            >
              <div className="website-card-top">
                <div className="website-icon">
                  🌐
                </div>

                <span
                  className={
                    project.status === "active"
                      ? "project-status active"
                      : "project-status"
                  }
                >
                  {project.status || "active"}
                </span>
              </div>

              <h2>{project.project_name}</h2>

              <p className="website-url">
                {project.website_url}
              </p>

              <p className="website-domain">
                {project.domain}
              </p>

              <div className="website-actions">
                <button
                  className="primary"
                  type="button"
                  onClick={() =>
                    openDashboard(project.id)
                  }
                >
                  Open Dashboard
                </button>

                <button
                  className="danger-button"
                  type="button"
                  onClick={() =>
                    handleDelete(project)
                  }
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* =================================================
          ADD WEBSITE MODAL
      ================================================= */}

      {showModal && (
        <div
          className="modal-overlay"
          onClick={() => {
            if (!saving) {
              setShowModal(false);
            }
          }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <small>NEW WEBSITE</small>

                <h2>Add Website</h2>
              </div>

              <button
                className="modal-close"
                type="button"
                disabled={saving}
                onClick={() =>
                  setShowModal(false)
                }
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <label>
                Website Name

                <input
                  type="text"
                  value={projectName}
                  onChange={(e) =>
                    setProjectName(e.target.value)
                  }
                  placeholder="Example: My Business Website"
                  disabled={saving}
                  required
                />
              </label>

              <label>
                Website URL

                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) =>
                    setWebsiteUrl(e.target.value)
                  }
                  placeholder="https://example.com"
                  disabled={saving}
                  required
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary"
                  disabled={saving}
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary"
                  disabled={saving}
                >
                  {saving
                    ? "Adding..."
                    : "Add Website"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}