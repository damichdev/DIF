import Encabezado from '../components/Encabezado.jsx'
import Seccion from '../components/Seccion.jsx'

export default function RegistrarPaciente() {

    function registrar(e) {
        e.preventDefault()
        const datos = Object.fromEntries(new FormData(e.target))
        console.log('Paciente a registrar:', datos)
        alert('Datos listos para enviar. Revisa la consola (F12).')
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
                            <input id="nombre" name="nombre" placeholder="Ej. Ana María" />
                        </div>

                        <div className="fila2">
                            <div className="f">
                                <label htmlFor="app">Apellido paterno</label>
                                <input id="app" name="ap_paterno" />
                            </div>
                            <div className="f">
                                <label htmlFor="apm">Apellido materno</label>
                                <input id="apm" name="ap_materno" />
                            </div>
                        </div>

                        <div className="f">
                            <label htmlFor="curp">CURP</label>
                            <input id="curp" name="curp" maxLength={18} placeholder="18 caracteres" className="mayus" />
                        </div>

                        <div className="fila2">
                            <div className="f">
                                <label htmlFor="fn">Fecha de nacimiento</label>
                                <input id="fn" name="fecha_nacimiento" type="date" />
                            </div>
                            <div className="f">
                                <label htmlFor="sexo">Sexo</label>
                                <select id="sexo" name="id_sexo">
                                    <option value="">Selecciona…</option>
                                </select>
                            </div>
                        </div>

                        <div className="fila2">
                            <div className="f">
                                <label htmlFor="tel">Teléfono</label>
                                <input id="tel" name="telefono" type="tel" maxLength={10} placeholder="10 dígitos" />
                            </div>
                            <div className="f">
                                <label htmlFor="da">Derecho ambiente</label>
                                <select id="da" name="id_derecho">
                                    <option value="">Selecciona…</option>
                                </select>
                            </div>
                        </div>
                    </Seccion>

                    {/* ---------- Tabla Expediente Clínico ---------- */}
                    <Seccion icono="expediente" titulo="Expediente clínico" sub="Se abre junto con el registro del paciente">
                        <div className="fila3">
                            <div className="f">
                                <label htmlFor="nexp">No. expediente</label>
                                <input id="nexp" placeholder="Automático" readOnly />
                            </div>
                            <div className="f">
                                <label htmlFor="fa">Fecha de apertura</label>
                                <input id="fa" placeholder="Automática" readOnly />
                            </div>
                            <div className="f">
                                <label htmlFor="ts">Tipo de sangre</label>
                                <select id="ts" name="tipo_sangre">
                                    <option value="">—</option>
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

                {/* ---------- Botones ---------- */}
                <div className="barra-acciones">
                    <p className="mini">Los campos del expediente marcados como automáticos los asigna el sistema.</p>
                    <div className="botones">
                        <button className="btn2" type="reset">Limpiar</button>
                        <button className="btn" type="submit">Registrar paciente</button>
                    </div>
                </div>
            </form>
        </>
    )
}