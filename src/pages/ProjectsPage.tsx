// src/pages/ProjectsPage.tsx

import React, { useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Download, 
  ArrowLeft,
  Calendar,
  Image,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ProjectsPage = () => {
  const { projects, currentProject, addProject, updateProject, deleteProject, setCurrentProject } = useUserStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Error",
        description: "El nombre del proyecto es requerido",
        variant: "destructive",
        duration: 4000
      });
      return;
    }

    const newProject = {
      id: crypto.randomUUID(),
      name: newProjectName.trim(),
      description: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: []
    };

    addProject(newProject);
    setNewProjectName('');
    setIsCreating(false);
    
    toast({
      title: "Proyecto creado",
      description: `"${newProject.name}" ha sido creado exitosamente`,
      duration: 4000
    });
  };

  const handleEditProject = (projectId: string, currentName: string) => {
    setEditingProject(projectId);
    setEditName(currentName);
  };

  const handleSaveEdit = () => {
    if (!editName.trim() || !editingProject) return;

    updateProject(editingProject, { name: editName.trim() });
    setEditingProject(null);
    setEditName('');
    
    toast({
      title: "Proyecto actualizado",
      description: "El nombre ha sido actualizado",
      duration: 4000
    });
  };

  const handleDeleteProject = (projectId: string, projectName: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar "${projectName}"?\n\nEsta acción no se puede deshacer.`)) {
      deleteProject(projectId);
      
      toast({
        title: "Proyecto eliminado",
        description: `"${projectName}" ha sido eliminado`,
        variant: "destructive",
        duration: 4000
      });
    }
  };

  const handleOpenProject = (project: any) => {
    setCurrentProject(project);
    navigate('/chat');
  };

  const handleDownloadProject = async (project: any) => {
    // Obtener todas las imágenes generadas por la IA del proyecto
    const aiImages = project.messages
      .filter((msg: any) => msg.role === 'assistant' && msg.imageUrl)
      .map((msg: any) => ({
        url: msg.imageUrl,
        prompt: msg.imagePrompt || msg.content,
        timestamp: msg.timestamp
      }));

    if (aiImages.length === 0) {
      toast({
        title: "Sin imágenes",
        description: "Este proyecto no tiene imágenes generadas para descargar",
        variant: "destructive",
        duration: 4000
      });
      return;
    }

    try {
      // Crear y descargar ZIP con todas las imágenes de IA
      const zip = new (await import('jszip')).default();
      
      for (let i = 0; i < aiImages.length; i++) {
        const image = aiImages[i];
        try {
          const response = await fetch(image.url);
          const blob = await response.blob();
          const fileName = `imagen_${i + 1}_${Date.now()}.jpg`;
          zip.file(fileName, blob);
        } catch (error) {
          console.error(`Error downloading image ${i + 1}:`, error);
        }
      }

      // Generar el ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Crear enlace de descarga
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Descarga completada",
        description: `ZIP con ${aiImages.length} imágenes descargado`,
        duration: 4000
      });
    } catch (error) {
      console.error('Error creating ZIP:', error);
      toast({
        title: "Error en la descarga",
        description: "No se pudo crear el archivo ZIP",
        variant: "destructive",
        duration: 4000
      });
    }
  };

  const getProjectStats = (project: any) => {
    const messageCount = project.messages?.length || 0;
    const imageCount = project.messages?.filter((msg: any) => msg.role === 'assistant' && msg.imageUrl).length || 0;
    return { messageCount, imageCount };
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/chat')}
              className="text-purple-400 hover:text-purple-300"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Chat
            </Button>
            <div>
              <h1 className="text-3xl font-light text-purple-100">Mis Proyectos</h1>
              <p className="text-purple-400/60 mt-1">Gestiona y descarga tus proyectos creativos</p>
            </div>
          </div>

          <Button
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Proyecto
          </Button>
        </div>

        {/* Create Project Form */}
        {isCreating && (
          <Card className="mb-6 bg-gradient-to-br from-purple-900/10 to-pink-900/10 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-purple-100">Crear Nuevo Proyecto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-3">
                <Input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Nombre del proyecto..."
                  className="flex-1 bg-purple-900/20 border-purple-500/30 text-purple-100"
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
                />
                <Button 
                  onClick={handleCreateProject}
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  Crear
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreating(false);
                    setNewProjectName('');
                  }}
                  className="border-purple-500/30 text-purple-300"
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Projects Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const stats = getProjectStats(project);
            const isEditing = editingProject === project.id;
            
            return (
              <Card 
                key={project.id} 
                className={`bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-slate-600/30 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 ${
                  currentProject?.id === project.id ? 'ring-2 ring-purple-500/50' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="text-lg font-medium bg-slate-800/50 border-slate-600/50"
                            onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                            autoFocus
                          />
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={handleSaveEdit}>
                              Guardar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setEditingProject(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-lg font-medium text-slate-100 mb-1">
                            {project.name}
                          </h3>
                          <div className="flex items-center space-x-3 text-xs text-slate-400">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                            </div>
                            {currentProject?.id === project.id && (
                              <Badge variant="outline" className="text-purple-400 border-purple-500/50">
                                Actual
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Stats */}
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center space-x-1 text-slate-400">
                        <MessageSquare className="h-3 w-3" />
                        <span>{stats.messageCount} mensajes</span>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-400">
                        <Image className="h-3 w-3" />
                        <span>{stats.imageCount} imágenes</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenProject(project)}
                        className="flex-1 border-slate-600/50 hover:border-purple-500/50"
                      >
                        Abrir
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditProject(project.id, project.name)}
                        className="border-slate-600/50 hover:border-blue-500/50"
                      >
                        <Edit2 className="h-3 w-3" />
                      </Button>

                      {stats.imageCount > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadProject(project)}
                          className="border-slate-600/50 hover:border-green-500/50"
                          title={`Descargar ${stats.imageCount} imágenes`}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteProject(project.id, project.name)}
                        className="border-slate-600/50 hover:border-red-500/50 text-red-400"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-16">
            <div className="text-slate-500 mb-4">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">No hay proyectos aún</h3>
              <p className="text-slate-400">Crea tu primer proyecto para comenzar</p>
            </div>
            <Button
              onClick={() => setIsCreating(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Proyecto
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;