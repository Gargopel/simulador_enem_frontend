import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '../contexts/AuthContext'
import { 
  BookOpen, 
  Clock, 
  Target, 
  TrendingUp, 
  Users, 
  Globe, 
  Calculator, 
  Atom,
  Play,
  CheckCircle
} from 'lucide-react'

const Dashboard = () => {
  const [areasDisponiveis, setAreasDisponiveis] = useState([])
  const [areasSelecionadas, setAreasSelecionadas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user, getAuthHeaders, API_BASE_URL } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    carregarAreasDisponiveis()
  }, [])

  const carregarAreasDisponiveis = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/areas-conhecimento`)
      const data = await response.json()
      setAreasDisponiveis(data)
    } catch (error) {
      console.error('Erro ao carregar áreas:', error)
      setError('Erro ao carregar áreas de conhecimento')
    }
  }

  const handleAreaChange = (areaId, checked) => {
    if (checked) {
      setAreasSelecionadas([...areasSelecionadas, areaId])
    } else {
      setAreasSelecionadas(areasSelecionadas.filter(id => id !== areaId))
    }
  }

  const criarSimulado = async () => {
    if (areasSelecionadas.length === 0) {
      setError('Selecione pelo menos uma área de conhecimento')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/criar-simulado`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          user_id: user.id,
          areas_selecionadas: areasSelecionadas
        })
      })

      const data = await response.json()

      if (response.ok) {
        navigate(`/simulado/${data.simulado_id}`)
      } else {
        setError(data.error || 'Erro ao criar simulado')
      }
    } catch (error) {
      console.error('Erro ao criar simulado:', error)
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const getAreaIcon = (areaId) => {
    const icons = {
      'linguagens': BookOpen,
      'ciencias_humanas': Users,
      'ciencias_natureza': Atom,
      'matematica': Calculator
    }
    return icons[areaId] || BookOpen
  }

  const getAreaColor = (areaId) => {
    const colors = {
      'linguagens': 'bg-blue-500',
      'ciencias_humanas': 'bg-green-500',
      'ciencias_natureza': 'bg-purple-500',
      'matematica': 'bg-orange-500'
    }
    return colors[areaId] || 'bg-gray-500'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Bem-vindo, {user?.username}!
        </h1>
        <p className="text-gray-600">
          Escolha as áreas de conhecimento para seu próximo simulado do ENEM
        </p>
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Simulados Feitos</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Melhor Nota</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Taxa de Acerto</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seleção de áreas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="h-5 w-5" />
                <span>Criar Novo Simulado</span>
              </CardTitle>
              <CardDescription>
                Selecione as áreas de conhecimento que deseja incluir no seu simulado. 
                Cada área contém 45 questões, como no ENEM real.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4 mb-6">
                {areasDisponiveis.map((area) => {
                  const IconComponent = getAreaIcon(area.id)
                  const colorClass = getAreaColor(area.id)
                  
                  return (
                    <div 
                      key={area.id} 
                      className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Checkbox
                        id={area.id}
                        checked={areasSelecionadas.includes(area.id)}
                        onCheckedChange={(checked) => handleAreaChange(area.id, checked)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${colorClass}`}>
                            <IconComponent className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <label 
                              htmlFor={area.id} 
                              className="text-sm font-medium text-gray-900 cursor-pointer"
                            >
                              {area.nome}
                            </label>
                            <p className="text-sm text-gray-600 mt-1">
                              {area.descricao}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  {areasSelecionadas.length > 0 && (
                    <span>
                      {areasSelecionadas.length} área(s) selecionada(s) • 
                      {areasSelecionadas.length * 45} questões
                    </span>
                  )}
                </div>
                <Button 
                  onClick={criarSimulado}
                  disabled={loading || areasSelecionadas.length === 0}
                  className="flex items-center space-x-2"
                >
                  <Play className="h-4 w-4" />
                  <span>{loading ? 'Criando...' : 'Iniciar Simulado'}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Informações sobre o ENEM */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sobre o ENEM</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Tempo de Prova</p>
                  <p className="text-sm text-gray-600">5h30min (1º dia) e 5h (2º dia)</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Total de Questões</p>
                  <p className="text-sm text-gray-600">180 questões + Redação</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Sistema TRI</p>
                  <p className="text-sm text-gray-600">Notas de 0 a 1000 pontos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dicas de Estudo</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                  Pratique regularmente com simulados
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                  Analise seus erros e acertos
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                  Gerencie bem o tempo de prova
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                  Foque nas áreas com menor desempenho
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

