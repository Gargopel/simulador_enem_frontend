import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '../contexts/AuthContext'
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Trophy,
  Clock,
  Users,
  Lightbulb,
  Star,
  ArrowRight
} from 'lucide-react'

const DicasEstudo = () => {
  const { user, getAuthHeaders, API_BASE_URL } = useAuth()
  
  const [estatisticas, setEstatisticas] = useState(null)
  const [dicasPersonalizadas, setDicasPersonalizadas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    carregarEstatisticas()
  }, [])

  const carregarEstatisticas = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/usuario/${user.id}/estatisticas`, {
        headers: getAuthHeaders()
      })

      const data = await response.json()

      if (response.ok) {
        setEstatisticas(data.estatisticas)
        gerarDicasPersonalizadas(data.estatisticas)
      } else {
        setError(data.error || 'Erro ao carregar estatísticas')
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  const gerarDicasPersonalizadas = (stats) => {
    const dicas = []

    // Analisar desempenho por área
    if (stats.desempenho_por_area) {
      Object.entries(stats.desempenho_por_area).forEach(([key, area]) => {
        if (area.media < 500) {
          dicas.push({
            tipo: 'area_critica',
            nivel: 'critico',
            titulo: `${area.nome.split(',')[0]} precisa de atenção urgente`,
            descricao: `Sua média em ${area.nome.split(',')[0]} está em ${area.media.toFixed(1)} pontos. É fundamental revisar os conceitos básicos desta área.`,
            sugestoes: [
              'Dedique pelo menos 2 horas diárias para esta área',
              'Revise a teoria básica antes de fazer exercícios',
              'Faça resumos dos principais conceitos',
              'Busque videoaulas explicativas',
              'Considere aulas particulares se necessário'
            ],
            icone: XCircle,
            cor: 'text-red-600',
            corFundo: 'bg-red-50',
            corBorda: 'border-red-200'
          })
        } else if (area.media < 600) {
          dicas.push({
            tipo: 'area_atencao',
            nivel: 'atencao',
            titulo: `${area.nome.split(',')[0]} pode melhorar`,
            descricao: `Sua média em ${area.nome.split(',')[0]} está em ${area.media.toFixed(1)} pontos. Com mais prática, você pode alcançar uma nota excelente.`,
            sugestoes: [
              'Pratique questões de nível médio e difícil',
              'Identifique os tópicos com mais erros',
              'Revise questões que errou anteriormente',
              'Estude em grupos ou com colegas',
              'Faça simulados focados nesta área'
            ],
            icone: AlertTriangle,
            cor: 'text-yellow-600',
            corFundo: 'bg-yellow-50',
            corBorda: 'border-yellow-200'
          })
        } else if (area.media >= 700) {
          dicas.push({
            tipo: 'area_excelente',
            nivel: 'excelente',
            titulo: `Excelente desempenho em ${area.nome.split(',')[0]}!`,
            descricao: `Parabéns! Sua média em ${area.nome.split(',')[0]} está em ${area.media.toFixed(1)} pontos. Continue mantendo este nível.`,
            sugestoes: [
              'Mantenha a regularidade nos estudos',
              'Resolva questões mais desafiadoras',
              'Ajude colegas com dificuldades nesta área',
              'Use esta área como motivação para as outras'
            ],
            icone: Trophy,
            cor: 'text-green-600',
            corFundo: 'bg-green-50',
            corBorda: 'border-green-200'
          })
        }
      })
    }

    // Dicas baseadas no tempo médio de prova
    if (stats.tempo_medio_prova) {
      if (stats.tempo_medio_prova > 300) { // Mais de 5 horas
        dicas.push({
          tipo: 'tempo_lento',
          nivel: 'atencao',
          titulo: 'Melhore seu gerenciamento de tempo',
          descricao: `Seu tempo médio de prova é ${stats.tempo_medio_prova.toFixed(0)} minutos. É importante otimizar o tempo para ter melhor desempenho.`,
          sugestoes: [
            'Pratique resolver questões com cronômetro',
            'Identifique questões fáceis primeiro',
            'Não gaste muito tempo em uma questão difícil',
            'Faça simulados completos respeitando o tempo',
            'Desenvolva estratégias de leitura rápida'
          ],
          icone: Clock,
          cor: 'text-orange-600',
          corFundo: 'bg-orange-50',
          corBorda: 'border-orange-200'
        })
      } else if (stats.tempo_medio_prova < 180) { // Menos de 3 horas
        dicas.push({
          tipo: 'tempo_rapido',
          nivel: 'atencao',
          titulo: 'Cuidado com a pressa',
          descricao: `Seu tempo médio de prova é ${stats.tempo_medio_prova.toFixed(0)} minutos. Talvez você esteja resolvendo muito rapidamente.`,
          sugestoes: [
            'Leia as questões com mais atenção',
            'Revise suas respostas antes de finalizar',
            'Não tenha pressa, use o tempo disponível',
            'Analise melhor as alternativas',
            'Verifique se não está "chutando" muito'
          ],
          icone: AlertTriangle,
          cor: 'text-yellow-600',
          corFundo: 'bg-yellow-50',
          corBorda: 'border-yellow-200'
        })
      }
    }

    // Dicas baseadas na evolução
    if (stats.evolucao && stats.evolucao.length >= 2) {
      const primeiraNota = stats.evolucao[0].nota
      const ultimaNota = stats.evolucao[stats.evolucao.length - 1].nota
      const evolucao = ultimaNota - primeiraNota

      if (evolucao > 50) {
        dicas.push({
          tipo: 'evolucao_positiva',
          nivel: 'excelente',
          titulo: 'Parabéns pela evolução!',
          descricao: `Você evoluiu ${evolucao.toFixed(1)} pontos desde o primeiro simulado. Continue assim!`,
          sugestoes: [
            'Mantenha a consistência nos estudos',
            'Continue praticando regularmente',
            'Analise o que tem funcionado bem',
            'Compartilhe suas estratégias com outros'
          ],
          icone: TrendingUp,
          cor: 'text-green-600',
          corFundo: 'bg-green-50',
          corBorda: 'border-green-200'
        })
      } else if (evolucao < -20) {
        dicas.push({
          tipo: 'evolucao_negativa',
          nivel: 'critico',
          titulo: 'Atenção: queda no desempenho',
          descricao: `Houve uma queda de ${Math.abs(evolucao).toFixed(1)} pontos em relação aos primeiros simulados. Vamos reverter isso!`,
          sugestoes: [
            'Revise sua estratégia de estudos',
            'Identifique o que mudou na rotina',
            'Considere descansar mais se estiver cansado',
            'Busque ajuda de professores ou colegas',
            'Volte aos conceitos básicos'
          ],
          icone: XCircle,
          cor: 'text-red-600',
          corFundo: 'bg-red-50',
          corBorda: 'border-red-200'
        })
      }
    }

    // Dicas gerais baseadas na média geral
    if (stats.media_geral < 400) {
      dicas.push({
        tipo: 'geral_critico',
        nivel: 'critico',
        titulo: 'Plano de estudos intensivo necessário',
        descricao: `Sua média geral está em ${stats.media_geral.toFixed(1)} pontos. É importante criar um plano de estudos mais estruturado.`,
        sugestoes: [
          'Dedique pelo menos 4 horas diárias aos estudos',
          'Crie um cronograma semanal de estudos',
          'Busque ajuda profissional (cursinho, professor particular)',
          'Foque nos conceitos mais básicos primeiro',
          'Faça simulados semanalmente'
        ],
        icone: Target,
        cor: 'text-red-600',
        corFundo: 'bg-red-50',
        corBorda: 'border-red-200'
      })
    } else if (stats.media_geral >= 600) {
      dicas.push({
        tipo: 'geral_bom',
        nivel: 'bom',
        titulo: 'Você está no caminho certo!',
        descricao: `Sua média geral está em ${stats.media_geral.toFixed(1)} pontos. Continue assim para alcançar uma nota ainda melhor.`,
        sugestoes: [
          'Mantenha a regularidade nos estudos',
          'Foque nas áreas com menor desempenho',
          'Pratique questões mais desafiadoras',
          'Revise periodicamente todos os conteúdos'
        ],
        icone: CheckCircle,
        cor: 'text-blue-600',
        corFundo: 'bg-blue-50',
        corBorda: 'border-blue-200'
      })
    }

    setDicasPersonalizadas(dicas)
  }

  const dicasGerais = [
    {
      categoria: 'Organização',
      dicas: [
        'Crie um cronograma de estudos realista e siga-o',
        'Organize um ambiente de estudos livre de distrações',
        'Use técnicas como Pomodoro para manter o foco',
        'Mantenha todos os materiais organizados e acessíveis'
      ]
    },
    {
      categoria: 'Prática',
      dicas: [
        'Faça simulados regularmente para se acostumar com o formato',
        'Pratique questões de provas anteriores do ENEM',
        'Cronometre seu tempo de resolução',
        'Revise sempre as questões que errou'
      ]
    },
    {
      categoria: 'Saúde Mental',
      dicas: [
        'Mantenha uma rotina de sono adequada',
        'Pratique exercícios físicos regularmente',
        'Reserve tempo para lazer e relaxamento',
        'Não se compare com outros estudantes'
      ]
    },
    {
      categoria: 'Estratégias de Prova',
      dicas: [
        'Leia todas as questões antes de começar',
        'Comece pelas questões que tem mais certeza',
        'Gerencie bem o tempo entre as questões',
        'Não deixe questões em branco'
      ]
    }
  ]

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
          Dicas de Estudo Personalizadas
        </h1>
        <p className="text-gray-600">
          Recomendações baseadas no seu desempenho nos simulados
        </p>
      </div>

      {/* Dicas personalizadas */}
      {dicasPersonalizadas.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <Star className="h-6 w-6 text-yellow-500 mr-2" />
            Dicas Personalizadas para Você
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dicasPersonalizadas.map((dica, index) => {
              const IconComponent = dica.icone
              
              return (
                <Card key={index} className={`${dica.corFundo} ${dica.corBorda} border-l-4`}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <IconComponent className={`h-6 w-6 ${dica.cor}`} />
                      <span className="text-gray-900">{dica.titulo}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 mb-4">{dica.descricao}</p>
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Sugestões:</h4>
                      <ul className="space-y-1">
                        {dica.sugestoes.map((sugestao, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start">
                            <ArrowRight className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                            {sugestao}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Dicas gerais */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Lightbulb className="h-6 w-6 text-blue-500 mr-2" />
          Dicas Gerais de Estudo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dicasGerais.map((categoria, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="text-lg">{categoria.categoria}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {categoria.dicas.map((dica, idx) => (
                    <li key={idx} className="text-gray-700 flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                      {dica}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recursos adicionais */}
      <div className="mt-8">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span>Recursos Adicionais</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Grupos de Estudo</h4>
                <p className="text-sm text-gray-600">Participe de grupos de estudo online ou presenciais</p>
              </div>
              <div className="text-center">
                <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Metas Semanais</h4>
                <p className="text-sm text-gray-600">Estabeleça metas de estudo alcançáveis para cada semana</p>
              </div>
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Acompanhe o Progresso</h4>
                <p className="text-sm text-gray-600">Use o histórico de simulados para monitorar sua evolução</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DicasEstudo

