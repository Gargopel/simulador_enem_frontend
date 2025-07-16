import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '../contexts/AuthContext'
import { 
  Trophy, 
  Clock, 
  Target, 
  TrendingUp, 
  BookOpen,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Home,
  RotateCcw
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar
} from 'recharts'

const Resultado = () => {
  const { simuladoId } = useParams()
  const { getAuthHeaders, API_BASE_URL } = useAuth()
  
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    carregarResultado()
  }, [simuladoId])

  const carregarResultado = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/resultado/${simuladoId}`, {
        headers: getAuthHeaders()
      })

      const data = await response.json()

      if (response.ok) {
        setResultado(data)
      } else {
        setError(data.error || 'Erro ao carregar resultado')
      }
    } catch (error) {
      console.error('Erro ao carregar resultado:', error)
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
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

  const getDicaIcon = (nivel) => {
    const icons = {
      'critico': XCircle,
      'atencao': AlertTriangle,
      'bom': CheckCircle,
      'excelente': Trophy
    }
    return icons[nivel] || AlertTriangle
  }

  const getDicaColor = (nivel) => {
    const colors = {
      'critico': 'text-red-600',
      'atencao': 'text-yellow-600',
      'bom': 'text-blue-600',
      'excelente': 'text-green-600'
    }
    return colors[nivel] || 'text-gray-600'
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

  if (!resultado) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Resultado não encontrado.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const { simulado, resultado: resultadoData, respostas_por_area } = resultado

  // Preparar dados para gráficos
  const dadosNotas = [
    { area: 'Linguagens', nota: resultadoData.nota_linguagens || 0, acertos: resultadoData.acertos_linguagens, total: resultadoData.total_questoes_linguagens },
    { area: 'C. Humanas', nota: resultadoData.nota_ciencias_humanas || 0, acertos: resultadoData.acertos_ciencias_humanas, total: resultadoData.total_questoes_ciencias_humanas },
    { area: 'C. Natureza', nota: resultadoData.nota_ciencias_natureza || 0, acertos: resultadoData.acertos_ciencias_natureza, total: resultadoData.total_questoes_ciencias_natureza },
    { area: 'Matemática', nota: resultadoData.nota_matematica || 0, acertos: resultadoData.acertos_matematica, total: resultadoData.total_questoes_matematica }
  ].filter(item => item.total > 0)

  const dadosAcertos = dadosNotas.map(item => ({
    area: item.area,
    acertos: item.acertos,
    erros: item.total - item.acertos,
    percentual: Math.round((item.acertos / item.total) * 100)
  }))

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B']

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Resultado do Simulado
            </h1>
            <p className="text-gray-600">
              Simulado realizado em {new Date(simulado.data_finalizacao).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="flex space-x-3">
            <Link to="/dashboard">
              <Button variant="outline" className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span>Início</span>
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button className="flex items-center space-x-2">
                <RotateCcw className="h-4 w-4" />
                <span>Novo Simulado</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Resumo geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Trophy className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Nota Geral</p>
                <p className={`text-2xl font-bold ${getNotaColor(resultadoData.nota_geral)}`}>
                  {resultadoData.nota_geral?.toFixed(1) || '0.0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Acertos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(resultadoData.acertos_linguagens || 0) + 
                   (resultadoData.acertos_ciencias_humanas || 0) + 
                   (resultadoData.acertos_ciencias_natureza || 0) + 
                   (resultadoData.acertos_matematica || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tempo Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatarTempo(simulado.tempo_total || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Acerto</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dadosAcertos.length > 0 
                    ? Math.round(dadosAcertos.reduce((acc, item) => acc + item.percentual, 0) / dadosAcertos.length)
                    : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Gráfico de notas por área */}
        <Card>
          <CardHeader>
            <CardTitle>Notas por Área de Conhecimento</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosNotas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="area" />
                <YAxis domain={[0, 1000]} />
                <Tooltip 
                  formatter={(value) => [value.toFixed(1), 'Nota']}
                  labelFormatter={(label) => `Área: ${label}`}
                />
                <Bar dataKey="nota" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de acertos e erros */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Acertos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosAcertos}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="acertos"
                  label={({ area, percentual }) => `${area}: ${percentual}%`}
                >
                  {dadosAcertos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detalhes por área */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dadosNotas.map((area, index) => (
          <Card key={area.area}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{area.area}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Nota:</span>
                  <Badge variant={getNotaBadgeVariant(area.nota)}>
                    {area.nota.toFixed(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Acertos:</span>
                  <span className="font-medium">{area.acertos}/{area.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Percentual:</span>
                  <span className="font-medium">
                    {Math.round((area.acertos / area.total) * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dicas de estudo */}
      {resultadoData.dicas_estudo && resultadoData.dicas_estudo.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Dicas de Estudo Personalizadas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {resultadoData.dicas_estudo.map((dica, index) => {
                const IconComponent = getDicaIcon(dica.nivel)
                
                return (
                  <div key={index} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex items-start space-x-3">
                      <IconComponent className={`h-5 w-5 mt-0.5 ${getDicaColor(dica.nivel)}`} />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{dica.area}</h4>
                        <p className="text-gray-700 mb-3">{dica.dica}</p>
                        {dica.sugestoes && dica.sugestoes.length > 0 && (
                          <ul className="space-y-1">
                            {dica.sugestoes.map((sugestao, idx) => (
                              <li key={idx} className="text-sm text-gray-600 flex items-start">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2"></div>
                                {sugestao}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Resultado

