import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '../contexts/AuthContext'
import { 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  CheckCircle,
  Circle,
  AlertTriangle
} from 'lucide-react'

const Simulado = () => {
  const { simuladoId } = useParams()
  const navigate = useNavigate()
  const { getAuthHeaders, API_BASE_URL } = useAuth()
  
  const [simulado, setSimulado] = useState(null)
  const [questoes, setQuestoes] = useState([])
  const [questaoAtual, setQuestaoAtual] = useState(0)
  const [respostas, setRespostas] = useState({})
  const [tempoInicio, setTempoInicio] = useState(null)
  const [tempoDecorrido, setTempoDecorrido] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [salvandoResposta, setSalvandoResposta] = useState(false)

  useEffect(() => {
    carregarSimulado()
    setTempoInicio(Date.now())
  }, [simuladoId])

  useEffect(() => {
    // Cronômetro
    const interval = setInterval(() => {
      if (tempoInicio) {
        setTempoDecorrido(Math.floor((Date.now() - tempoInicio) / 1000))
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [tempoInicio])

  const carregarSimulado = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/simulado/${simuladoId}`, {
        headers: getAuthHeaders()
      })

      const data = await response.json()

      if (response.ok) {
        setSimulado(data.simulado)
        setQuestoes(data.questoes)
      } else {
        setError(data.error || 'Erro ao carregar simulado')
      }
    } catch (error) {
      console.error('Erro ao carregar simulado:', error)
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const salvarResposta = async (questaoId, resposta) => {
    setSalvandoResposta(true)
    
    try {
      await fetch(`${API_BASE_URL}/responder-questao`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          simulado_id: parseInt(simuladoId),
          questao_id: questaoId,
          resposta_usuario: resposta,
          tempo_resposta: tempoDecorrido
        })
      })
    } catch (error) {
      console.error('Erro ao salvar resposta:', error)
    } finally {
      setSalvandoResposta(false)
    }
  }

  const handleRespostaChange = (questaoId, resposta) => {
    setRespostas(prev => ({
      ...prev,
      [questaoId]: resposta
    }))
    
    // Salvar resposta automaticamente
    salvarResposta(questaoId, resposta)
  }

  const proximaQuestao = () => {
    if (questaoAtual < questoes.length - 1) {
      setQuestaoAtual(questaoAtual + 1)
    }
  }

  const questaoAnterior = () => {
    if (questaoAtual > 0) {
      setQuestaoAtual(questaoAtual - 1)
    }
  }

  const irParaQuestao = (index) => {
    setQuestaoAtual(index)
  }

  const finalizarSimulado = async () => {
    if (window.confirm('Tem certeza que deseja finalizar o simulado? Esta ação não pode ser desfeita.')) {
      try {
        const response = await fetch(`${API_BASE_URL}/finalizar-simulado`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders()
          },
          body: JSON.stringify({
            simulado_id: parseInt(simuladoId),
            tempo_total: tempoDecorrido
          })
        })

        if (response.ok) {
          navigate(`/resultado/${simuladoId}`)
        } else {
          const data = await response.json()
          setError(data.error || 'Erro ao finalizar simulado')
        }
      } catch (error) {
        console.error('Erro ao finalizar simulado:', error)
        setError('Erro de conexão')
      }
    }
  }

  const formatarTempo = (segundos) => {
    const horas = Math.floor(segundos / 3600)
    const minutos = Math.floor((segundos % 3600) / 60)
    const segs = segundos % 60
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`
  }

  const getStatusQuestao = (index) => {
    const questao = questoes[index]
    if (!questao) return 'nao-respondida'
    
    return respostas[questao.id] ? 'respondida' : 'nao-respondida'
  }

  const questoesRespondidas = Object.keys(respostas).length
  const progressoPercentual = questoes.length > 0 ? (questoesRespondidas / questoes.length) * 100 : 0

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

  if (!questoes.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Nenhuma questão encontrada para este simulado.</AlertDescription>
        </Alert>
      </div>
    )
  }

  const questaoAtualData = questoes[questaoAtual]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixo */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-gray-900">
                Simulado ENEM
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>{formatarTempo(tempoDecorrido)}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Questão {questaoAtual + 1} de {questoes.length}
              </div>
              <Button 
                variant="destructive" 
                onClick={finalizarSimulado}
                className="flex items-center space-x-1"
              >
                <Flag className="h-4 w-4" />
                <span>Finalizar</span>
              </Button>
            </div>
          </div>
          
          {/* Barra de progresso */}
          <div className="pb-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progresso: {questoesRespondidas}/{questoes.length} questões</span>
              <span>{Math.round(progressoPercentual)}% concluído</span>
            </div>
            <Progress value={progressoPercentual} className="h-2" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Questão principal */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Questão {questaoAtual + 1}</span>
                  <span className="text-sm font-normal text-gray-600">
                    {questaoAtualData.area_conhecimento} • {questaoAtualData.disciplina}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enunciado */}
                <div className="prose max-w-none">
                  <div 
                    className="text-gray-900 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: questaoAtualData.enunciado }}
                  />
                </div>

                {/* Alternativas */}
                <div className="space-y-3">
                  {questaoAtualData.alternativas.map((alternativa, index) => {
                    const letra = String.fromCharCode(65 + index) // A, B, C, D, E
                    const isSelected = respostas[questaoAtualData.id] === letra
                    
                    return (
                      <div 
                        key={letra}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handleRespostaChange(questaoAtualData.id, letra)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-500 text-white' 
                              : 'border-gray-300 text-gray-600'
                          }`}>
                            {letra}
                          </div>
                          <div 
                            className="flex-1 text-gray-900"
                            dangerouslySetInnerHTML={{ __html: alternativa }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Navegação */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <Button 
                    variant="outline" 
                    onClick={questaoAnterior}
                    disabled={questaoAtual === 0}
                    className="flex items-center space-x-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Anterior</span>
                  </Button>
                  
                  <div className="text-sm text-gray-600">
                    {salvandoResposta && 'Salvando...'}
                  </div>
                  
                  <Button 
                    onClick={proximaQuestao}
                    disabled={questaoAtual === questoes.length - 1}
                    className="flex items-center space-x-1"
                  >
                    <span>Próxima</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Navegação lateral */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Navegação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {questoes.map((_, index) => {
                    const status = getStatusQuestao(index)
                    const isAtual = index === questaoAtual
                    
                    return (
                      <button
                        key={index}
                        onClick={() => irParaQuestao(index)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                          isAtual
                            ? 'bg-blue-600 text-white'
                            : status === 'respondida'
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {index + 1}
                      </button>
                    )
                  })}
                </div>
                
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-100 rounded"></div>
                    <span className="text-gray-600">Respondida</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-gray-100 rounded"></div>
                    <span className="text-gray-600">Não respondida</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span className="text-gray-600">Atual</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Simulado

