import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Search, 
  ArrowLeft,
  Calendar,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const AdminUsuarios = () => {
  const navigate = useNavigate()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    per_page: 20
  })
  const API_BASE_URL = (
    process.env.NODE_ENV === "production"
      ? "https://58hpi8c7z355.manus.space"
      : "http://localhost:5001"
  )'

  useEffect(() => {
    // Verificar se está logado
    const token = localStorage.getItem('adminToken')
    if (!token) {
      navigate('/admin/login')
      return
    }

    loadUsuarios()
  }, [navigate, pagination.page, search])

  const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken')
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  }

  const loadUsuarios = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        per_page: pagination.per_page,
        ...(search && { search })
      })

      const response = await fetch(`${API_BASE_URL}/admin/usuarios?${params}`, {
        headers: getAuthHeaders()
      })

      if (response.ok) {
        const data = await response.json()
        setUsuarios(data.usuarios)
        setPagination(data.pagination)
      } else if (response.status === 401) {
        navigate('/admin/login')
      } else {
        setError('Erro ao carregar usuários')
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const changePage = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center space-x-1"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-blue-600" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Gerenciar Usuários
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Search and Stats */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          
          <div className="text-sm text-gray-600">
            Total: {pagination.total} usuários
          </div>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : usuarios.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum usuário encontrado
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Usuário
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Email
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Data de Cadastro
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Simulados
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">
                        Última Atividade
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((usuario) => (
                      <tr key={usuario.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {usuario.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="font-medium text-gray-900">
                              {usuario.username}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          {usuario.email}
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(usuario.data_criacao)}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-gray-900">
                              {usuario.total_simulados}
                            </div>
                            <div className="text-xs text-gray-500">
                              {usuario.simulados_finalizados} finalizados
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Activity className="h-4 w-4" />
                            <span>{formatDate(usuario.ultima_atividade)}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <div className="text-sm text-gray-600">
                  Página {pagination.page} de {pagination.pages}
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changePage(pagination.page - 1)}
                    disabled={!pagination.has_prev}
                    className="flex items-center space-x-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Anterior</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => changePage(pagination.page + 1)}
                    disabled={!pagination.has_next}
                    className="flex items-center space-x-1"
                  >
                    <span>Próxima</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminUsuarios

