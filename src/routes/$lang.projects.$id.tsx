import { useParams } from "react-router"

export default function ProjectDetail() {
  const { id } = useParams()
  return (
    <main id="main">
      <h1>Projeto {id ?? "desconhecido"}</h1>
    </main>
  )
}
