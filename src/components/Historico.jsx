import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '../contexts/AuthContext'
import { 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp, 
  Eye,
  AlertTriangle,
  Trophy,
  BarChart3,
  CheckCircle
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'

const Historico = () => {
  const { user, getAuthHeaders, API_BASE_URL } = useAuth()
  
  const [simulados, setSimulados] = useState([])
  const [estatisticas, setEstatisticas] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    carregarHistorico()
    carregarEstatisticas()
  }, [])

  const carregarHistorico = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/usuario/${user.id}/simulados`, {
        headers: getAuthHeaders()
      })

      const data = await response.json()

      if (response.ok) {
        setSimulados(data.simulados)
      } else {
        setError(data.error || 'Erro ao carregar histórico')
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error)
      setError('Erro de conexão')
    }
  }

  const carregarEstatisticas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/usuario/${user.id}/estatisticas`, {
        headers: getAuthHeaders()
      })

      const data = await response.json()

      if (response.ok) {
        setEstatisticas(data.estatisticas)
      } else {
        console.error('Erro ao carregar estatísticas:', data.error)
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatarData = (dataString) => {
    return new Date(dataString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatarTempo = (segundos) => {
    const horas = Math.floor(segundos / 3600)
    const minutos = Math.floor((segundos % 3600) / 60)
    return `${horas}h ${minutos}min`
  }

  const getNotaColor = (nota) => {
    if (nota >= 700) return 'text-green-600'
    if (nota >= 500) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getNotaBadgeVariant = (nota) => {
    if (nota >= 700) return 'default'
    if (nota >= 500) return 'secondary'
    return 'destructive'
  }

  const getStatusBadge = (simulado) => {
    if (simulado.finalizado) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Finalizado</Badge>
    }
    return <Badge variant="secondary">Em andamento</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Histórico de Simulados
        </h1>
        <p className="text-gray-600">
          Acompanhe seu progresso e evolução nos estudos
        </p>
      </div>

      {/* Estatísticas gerais */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total de Simulados</p>
                  <p className="text-2xl font-bold text-gray-900">{simulados.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Trophy className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Melhor Nota</p>
                  <p className={`text-2xl font-bold ${getNotaColor(estatisticas.melhor_nota)}`}>
                    {estatisticas.melhor_nota?.toFixed(1) || '0.0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Média Geral</p>
                  <p className={`text-2xl font-bold ${getNotaColor(estatisticas.media_geral)}`}>
                    {estatisticas.media_geral?.toFixed(1) || '0.0'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {estatisticas.tempo_medio_prova ? `${estatisticas.tempo_medio_prova.toFixed(0)}min` : '0min'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos de evolução */}
      {estatisticas && estatisticas.evolucao && estatisticas.evolucao.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico de evolução das notas */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução das Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={estatisticas.evolucao}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="data" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis domain={[0, 1000]} />
                  <Tooltip 
                    formatter={(value) => [value.toFixed(1), 'Nota']}
                    labelFormatter={(label) => `Data: ${new Date(label).toLocaleDateString('pt-BR')}`}
                  />
                  <Line type="monotone" dataKey="nota" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de desempenho por área */}
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Área</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(estatisticas.desempenho_por_area || {}).map(([key, value]) => ({
                  area: value.nome.split(',')[0], // Pegar só a primeira parte do nome
                  media: value.media
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="area" />
                  <YAxis domain={[0, 1000]} />
                  <Tooltip formatter={(value) => [value.toFixed(1), 'Média']} />
                  <Bar dataKey="media" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de simulados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Simulados Realizados</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {simulados.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum simulado encontrado</h3>
              <p className="text-gray-600 mb-4">Você ainda não realizou nenhum simulado.</p>
              <Link to="/dashboard">
                <Button>Fazer Primeiro Simulado</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {simulados.map((simulado) => (
                <div 
                  key={simulado.id} 
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900">
                          Simulado #{simulado.id}
                        </h3>
                        {getStatusBadge(simulado)}
                        {simulado.resultado && (
                          <Badge variant={getNotaBadgeVariant(simulado.resultado.nota_geral)}>
                            Nota: {simulado.resultado.nota_geral?.toFixed(1)}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {simulado.data_finalizacao 
                              ? formatarData(simulado.data_finalizacao)
                              : formatarData(simulado.data_criacao)
                            }
                          </span>
                        </div>
                        
                        {simulado.tempo_total && (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{formatarTempo(simulado.tempo_total)}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4" />
                          <span>{simulado.areas_selecionadas.length} área(s)</span>
                        </div>
                      </div>
                      
                      {simulado.resultado && (
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {simulado.resultado.nota_linguagens && (
                            <div>
                              <span className="text-gray-600">Linguagens:</span>
                              <span className={`ml-1 font-medium ${getNotaColor(simulado.resultado.nota_linguagens)}`}>
                                {simulado.resultado.nota_linguagens.toFixed(1)}
                              </span>
                            </div>
                          )}
                          {simulado.resultado.nota_ciencias_humanas && (
                            <div>
                              <span className="text-gray-600">C. Humanas:</span>
                              <span className={`ml-1 font-medium ${getNotaColor(simulado.resultado.nota_ciencias_humanas)}`}>
                                {simulado.resultado.nota_ciencias_humanas.toFixed(1)}
                              </span>
                            </div>
                          )}
                          {simulado.resultado.nota_ciencias_natureza && (
                            <div>
                              <span className="text-gray-600">C. Natureza:</span>
                              <span className={`ml-1 font-medium ${getNotaColor(simulado.resultado.nota_ciencias_natureza)}`}>
                                {simulado.resultado.nota_ciencias_natureza.toFixed(1)}
                              </span>
                            </div>
                          )}
                          {simulado.resultado.nota_matematica && (
                            <div>
                              <span className="text-gray-600">Matemática:</span>
                              <span className={`ml-1 font-medium ${getNotaColor(simulado.resultado.nota_matematica)}`}>
                                {simulado.resultado.nota_matematica.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      {simulado.finalizado ? (
                        <Link to={`/resultado/${simulado.id}`}>
                          <Button variant="outline" size="sm" className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>Ver Resultado</span>
                          </Button>
                        </Link>
                      ) : (
                        <Link to={`/simulado/${simulado.id}`}>
                          <Button size="sm" className="flex items-center space-x-1">
                            <CheckCircle className="h-4 w-4" />
                            <span>Continuar</span>
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Historico

