'use client'

import { useEffect } from 'react'

export default function RegisterServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Desregistrar todos los service workers antiguos
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister().then(() => {
            console.log('Service Worker antiguo desregistrado')
          })
        })
      })

      // Limpiar todos los cachés
      if ('caches' in window) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            caches.delete(cacheName).then(() => {
              console.log('Caché eliminado:', cacheName)
            })
          })
        })
      }

      // Registrar el nuevo service worker
      setTimeout(() => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Service Worker nuevo registrado:', registration)
            
            // Forzar actualización si hay uno esperando
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // Nuevo service worker disponible, recargar
                    window.location.reload()
                  }
                })
              }
            })
          })
          .catch((error) => {
            console.log('Error al registrar Service Worker:', error)
          })
      }, 1000)
    }
  }, [])

  return null
}



