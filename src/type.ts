export interface Pokemon {
  id: number
  name: string
  sprites: {
    other: {
      showdown: {
        back_default: string
        front_default: string
      }
    }
  }
  types: Array<{ type: { name: string } }>
  abilities: Array<{ ability: { name: string } }>
  stats: Array<{ base_stat: number; stat: { name: string } }>
  cries: { latest: string }
}

export interface Evolutions {
  species: { name: string }
  evolves_to: Evolutions[]
}
