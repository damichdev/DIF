import Encabezado from '../components/Encabezado.jsx'
import Seccion from '../components/Seccion.jsx'
import { useState } from 'react'
import { api, hoy } from '../api.js'
import { SEXOS, DERECHOS, TIPOS_SANGRE } from '../catalogos.js'

export default function RegistrarPaciente() {
    const [msg, setMsg] = useState(null)
    const [enviando, setEnviando] = useState(false)
    const [exp, setExp] = useState(null)

    async function registrar(e) {
        e.preventDefault()
        const form = e.target
        const d = Object.fromEntries(new FormData(form))
        setEnviando(true)
        setMsg(null)
        let paciente
        try {
            paciente = await api('/api/pacientes', 'POST', {
                nombrePaciente: d.nombrePaciente,
                apPaterno: d.apPaterno,
                apMaterno: d.apMaterno || null,
                curp: d.curp.toUpperCase(),
                fechaNacimiento: d.fechaNacimiento,
                telefono: d.telefono || null,
                idSexo: Number(d.idSexo),
                idDerechoAmbiente: Number(d.idDerechoAmbiente),
            })
            const expediente = await api('/api/expedientes', 'POST', {
                noExpediente: 'EXP-' + String(paciente.idPaciente).padStart(5, '0'),
                fechaApertura: hoy(),
                tipoSangre: d.tipoSangre,
                alergias: d.alergias || null,
                antecedentes: d.antecedentes || null,
                idPaciente: paciente.idPaciente,
            })
            setExp(expediente)
            setMsg({ ok: true, texto: `Paciente registrado con expediente ${expediente.noExpediente}.` })
            form.reset()
        } catch (err) {
            setMsg({ ok: false, texto: paciente
                ? `El paciente se guardó (ID ${paciente.idPaciente}) pero el expediente falló: ${err.message}`
                : err.message })
        } finally {
            setEnviando(false)
        }
    }

    return (
        <>
            <Encabezado
                icono="usuarioMas"
                area="Recepción"
                titulo="Registrar paciente"
                sub="Alta del paciente y apertura de su expediente clínico"
            />

            <form className="cont" onSubmit={registrar}>
                <div className="grid2">
                    {/* ---------- Tabla Paciente ---------- */}
                    <Seccion icono="usuario" titulo="Datos del paciente" sub="Información personal y de contacto">
                        <div className="f">
                            <label htmlFor="nombre">Nombre(s)</label>
                            <input id="nombre" name="nombrePaciente" required placeholder="Ej. Ana María" />
                        </div>

                        <div className="fila2">
                            <div className="f">
                                <label htmlFor="app">Apellido paterno</label>
                                <input id="app" name="apPaterno" required />
                            </div>
                            <div className="f">
                                <label htmlFor="apm">Apellido materno</label>
                                <input id="apm" name="apMaterno" />
                            </div>
                        </div>

                        <div className="f">
                            <label htmlFor="curp">CURP</label>
                            <input id="curp" name="curp" required minLength={18} maxLength={18} placeholder="18 caracteres" className="mayus" />
                        </div>

                        <div className="fila2">
                            <div className="f">
                                <label htmlFor="fn">Fecha de nacimiento</label>
                                <input id="fn" name="fechaNacimiento" type="date" required />
                            </div>
                            <div className="f">
                                <label htmlFor="sexo">Sexo</label>
                                <select id="sexo" name="idSexo" required>
                                    <option value="">Selecciona…</option>
                                    {SEXOS.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="fila2">
                            <div className="f">
                                <label htmlFor="tel">Teléfono</label>
                                <input id="tel" name="telefono" type="tel" pattern="[0-9]{10}" maxLength={10} placeholder="10 dígitos" />
                            </div>
                            <div className="f">
                                <label htmlFor="da">Derecho ambiente</label>
                                <select id="da" name="idDerechoAmbiente" required>
                                    <option value="">Selecciona…</option>
                                    {DERECHOS.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
                                </select>
                            </div>
                        </div>
                    </Seccion>

                    {/* ---------- Tabla Expediente Clínico ---------- */}
                    <Seccion icono="expediente" titulo="Expediente clínico" sub="Se abre junto con el registro del paciente">
                        <div className="fila3">
                            <div className="f">
                                <label htmlFor="nexp">No. expediente</label>
                                <input id="nexp" placeholder="Automático" value={exp?.noExpediente ?? ''} readOnly />
                            </div>
                            <div className="f">
                                <label htmlFor="fa">Fecha de apertura</label>
                                <input id="fa" placeholder="Automática" value={exp?.fechaApertura ?? ''} readOnly />
                            </div>
                            <div className="f">
                                <label htmlFor="ts">Tipo de sangre</label>
                                <select id="ts" name="tipoSangre" required>
                                    <option value="">—</option>
                                    {TIPOS_SANGRE.map((t) => <option key={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="f">
                            <label htmlFor="alg">Alergias</label>
                            <input id="alg" name="alergias" placeholder="Ej. Penicilina · deja vacío si no tiene" />
                        </div>

                        <div className="f">
                            <label htmlFor="ant">Antecedentes</label>
                            <textarea id="ant" name="antecedentes" rows={7}
                                placeholder="Heredofamiliares, personales patológicos y no patológicos" />
                        </div>
                    </Seccion>
                </div>

                {msg && <p className={msg.ok ? 'ok' : 'err'} role="status">{msg.texto}</p>}

                {/* ---------- Botones ---------- */}
                <div className="barra-acciones">
                    <p className="mini">Los campos del expediente marcados como automáticos los asigna el sistema.</p>
                    <div className="botones">
                        <button className="btn2" type="reset">Limpiar</button>
                        <button className="btn" type="submit" disabled={enviando}>{enviando ? 'Guardando…' : 'Registrar paciente'}</button>
                    </div>
                </div>
            </form>
        </>
    )
}