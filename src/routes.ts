import { type RouteConfig, index, layout, route } from "@react-router/dev/routes"

export default [
  index("routes/_root-redirect.tsx"),
  layout("routes/$lang.tsx", [
    route(":lang", "routes/$lang._index.tsx"),
    route(":lang/projects", "routes/$lang.projects._index.tsx"),
    route(":lang/projects/:id", "routes/$lang.projects.$id.tsx"),
  ]),
] satisfies RouteConfig
