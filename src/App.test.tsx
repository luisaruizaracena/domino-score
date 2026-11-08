import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { STORAGE_KEY } from './lib/storage'

const score = (name: RegExp) => within(screen.getByRole('article', { name })).getByText(/^\d+$/, { selector: 'p' })

async function anotar(user: ReturnType<typeof userEvent.setup>, pareja: string, puntos: string) {
  await user.click(screen.getByRole('radio', { name: pareja }))
  const input = screen.getByLabelText('Puntos de la mano')
  await user.clear(input)
  await user.type(input, puntos)
  await user.click(screen.getByRole('button', { name: 'Anotar puntos' }))
}

describe('App', () => {
  it('muestra la pantalla principal con valores iniciales', () => {
    render(<App />)
    expect(screen.getByText(/Meta:/)).toHaveTextContent('Meta: 200 puntos')
    expect(score(/^Pareja 1/)).toHaveTextContent('0')
    expect(score(/^Pareja 2/)).toHaveTextContent('0')
    expect(screen.getByText('Papá y Yo')).toBeInTheDocument()
    expect(screen.getByText('Mamá y Tía')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Anotar puntos' })).toBeDisabled()
  })

  it('los botones rápidos fijan el valor sin acumular', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: '+10' }))
    await user.click(screen.getByRole('button', { name: '+25' }))
    expect(screen.getByLabelText('Puntos de la mano')).toHaveValue('25')
  })

  it('el campo solo admite dígitos', async () => {
    const user = userEvent.setup()
    render(<App />)
    const input = screen.getByLabelText('Puntos de la mano')
    await user.type(input, '-1.5a')
    expect(input).toHaveValue('15')
    await user.clear(input)
    await user.type(input, '0')
    expect(screen.getByRole('button', { name: 'Anotar puntos' })).toBeDisabled()
  })

  it('anota, actualiza marcador, historial y localStorage, y limpia el campo', async () => {
    const user = userEvent.setup()
    render(<App />)
    await anotar(user, 'Pareja 2', '40')
    expect(score(/^Pareja 2/)).toHaveTextContent('40')
    expect(score(/^Pareja 1/)).toHaveTextContent('0')
    expect(screen.getByLabelText('Puntos de la mano')).toHaveValue('')
    expect(screen.getByRole('status')).toHaveTextContent('+40 a Pareja 2')
    const row = screen.getAllByRole('row')[1]
    expect(row).toHaveTextContent('1Pareja 2+400–40')
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(saved.current.hands).toHaveLength(1)
  })

  it('un doble envío instantáneo no duplica la mano', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.type(screen.getByLabelText('Puntos de la mano'), '20')
    const form = screen.getByRole('button', { name: 'Anotar puntos' }).closest('form')!
    fireEvent.submit(form)
    fireEvent.submit(form)
    expect(score(/^Pareja 1/)).toHaveTextContent('20')
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).current.hands).toHaveLength(1)
  })

  it('recupera la partida al recargar', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await anotar(user, 'Pareja 1', '25')
    unmount()
    render(<App />)
    expect(score(/^Pareja 1/)).toHaveTextContent('25')
  })

  it('muestra solo las 3 últimas manos y permite ver todas', async () => {
    const user = userEvent.setup()
    render(<App />)
    for (const p of ['5', '10', '20', '25']) await anotar(user, 'Pareja 1', p)
    expect(screen.getAllByRole('row')).toHaveLength(4) // cabecera + 3
    await user.click(screen.getByRole('button', { name: /Ver todas las manos/ }))
    expect(screen.getAllByRole('row')).toHaveLength(5)
  })

  it('deshacer pide confirmación', async () => {
    const user = userEvent.setup()
    render(<App />)
    await anotar(user, 'Pareja 1', '30')
    await user.click(screen.getByRole('button', { name: 'Deshacer' }))
    const dialog = screen.getByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Deshacer' }))
    expect(score(/^Pareja 1/)).toHaveTextContent('0')
  })

  it('corrige una mano anterior y recalcula', async () => {
    const user = userEvent.setup()
    render(<App />)
    await anotar(user, 'Pareja 1', '40')
    await anotar(user, 'Pareja 2', '40')
    await user.click(screen.getByRole('button', { name: 'Corregir mano 1' }))
    const dialog = screen.getByRole('dialog')
    const input = within(dialog).getByLabelText('Puntos')
    await user.clear(input)
    await user.type(input, '15')
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))
    expect(score(/^Pareja 1/)).toHaveTextContent('15')
    expect(screen.getAllByRole('row')[1]).toHaveTextContent('15–40')
  })

  it('eliminar una mano pide confirmación', async () => {
    const user = userEvent.setup()
    render(<App />)
    await anotar(user, 'Pareja 1', '40')
    await user.click(screen.getByRole('button', { name: 'Corregir mano 1' }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' }))
    expect(score(/^Pareja 1/)).toHaveTextContent('40')
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Sí, eliminar' }))
    expect(score(/^Pareja 1/)).toHaveTextContent('0')
  })

  it('al llegar a la meta muestra ganadores, bloquea anotar y la revancha conserva nombres', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Editar Pareja 1' }))
    const nombre = screen.getByLabelText('Nombre de la pareja 1')
    await user.clear(nombre)
    await user.type(nombre, 'Los Primos')
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    await anotar(user, 'Los Primos', '150')
    await anotar(user, 'Los Primos', '75')
    const dialog = screen.getByRole('dialog', { name: '¡Tenemos ganadores!' })
    expect(dialog).toHaveTextContent('Los Primos')
    expect(dialog).toHaveTextContent('225')
    expect(dialog).toHaveTextContent('2 manos disputadas')

    await user.click(within(dialog).getByRole('button', { name: 'Ver marcador' }))
    expect(screen.getByRole('button', { name: 'Anotar puntos' })).toBeDisabled()
    expect(screen.getByLabelText('Puntos de la mano')).toBeDisabled()

    await user.click(screen.getByRole('button', { name: /Ver resultado/ }))
    await user.click(screen.getByRole('button', { name: /Revancha/ }))
    expect(score(/^Los Primos/)).toHaveTextContent('0')
    expect(screen.getByLabelText('Puntos de la mano')).toBeEnabled()
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(saved.archive).toHaveLength(1)
  })

  it('nueva partida confirma antes de reiniciar y guarda la anterior', async () => {
    const user = userEvent.setup()
    render(<App />)
    await anotar(user, 'Pareja 1', '20')
    await user.click(screen.getByRole('button', { name: 'Nueva partida' }))
    await user.click(screen.getByRole('button', { name: 'Empezar partida' }))
    expect(screen.getByRole('dialog', { name: '¿Reiniciar la partida?' })).toBeInTheDocument()
    expect(score(/^Pareja 1/)).toHaveTextContent('20')
    await user.click(screen.getByRole('button', { name: 'Sí, reiniciar' }))
    expect(score(/^Pareja 1/)).toHaveTextContent('0')
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!)
    expect(saved.archive).toHaveLength(1)
    expect(saved.archive[0].hands[0].points).toBe(20)
  })
})
