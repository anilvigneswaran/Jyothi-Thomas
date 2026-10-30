import { useEffect, useRef } from 'react'
import { director, DirectorState } from './director'

export function useDirector(callback: (state: DirectorState) => void) {
  const cbRef = useRef(callback)
  cbRef.current = callback

  useEffect(() => {
    const unsub = director.subscribe((state) => {
      cbRef.current(state)
    })
    return unsub
  }, [])
}

export function useSectionRegistration(id: string) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (ref.current) {
      director.registerSection(id, ref.current)
    }
    return () => {
      director.registerSection(id, null)
    }
  }, [id])

  return ref
}
