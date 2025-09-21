tasks
tasks have subtasks
task search
tasks page shows all tasks
tasks have priority
tasks have estimate
tasks have dependencies
tasks have acceptance criteria
tasks have tests
tasks have files
tasks have notes
tasks have a done boolean

type Task {
  i: string
  n: string // name
  desc?: string
  subtasks: Task[]
  f: FileEntry[]
  d: boolean
}

type FileEntry {
  p: string // path
  n: string // name
  t: string // type
}
