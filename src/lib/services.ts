export type BarberService = {
  id: string
  name: string
  description: string
  duration: string
  priceLabel: string
  image: string
  imageAlt: string
}

export const services: BarberService[] = [
  {
    id: "corte",
    name: "Corte clássico",
    description: "Precisão no corte, acabamento limpo e atenção ao estilo que combina com você.",
    duration: "40 min",
    priceLabel: "Consulte",
    image: "/images/services/corte-classico.jpg",
    imageAlt: "Barbeiro finalizando um corte clássico masculino",
  },
  {
    id: "barba",
    name: "Barba & toalha quente",
    description: "Modelagem cuidadosa, toalha quente e finalização para renovar o visual.",
    duration: "30 min",
    priceLabel: "Consulte",
    image: "/images/services/barba-toalha-quente.jpg",
    imageAlt: "Barbeiro aparando cuidadosamente a barba de um cliente",
  },
  {
    id: "combo",
    name: "Corte + barba",
    description: "Um cuidado completo para sair com o visual alinhado da cabeça à barba.",
    duration: "60 min",
    priceLabel: "Consulte",
    image: "/images/services/corte-barba.jpg",
    imageAlt: "Ferramentas profissionais usadas em um serviço completo de corte e barba",
  },
  {
    id: "acabamento",
    name: "Acabamento",
    description: "Ajustes e contornos para manter o corte sempre bem cuidado.",
    duration: "20 min",
    priceLabel: "Consulte",
    image: "/images/services/acabamento.jpg",
    imageAlt: "Detalhe de acabamento preciso com navalha em um corte masculino",
  },
]
