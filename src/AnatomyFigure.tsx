import type { Gender } from "./types";

type View = "Front" | "Back";

export default function AnatomyFigure({ gender, view, selected, onSelect, compact = false }: { gender: Gender; view: View; selected?: string; onSelect?: (muscle: string) => void; compact?: boolean }) {
  const interactive = !!onSelect;
  const region = (name: string, shapes: React.ReactNode) => <g className={`anatomy-region ${selected === name ? "selected" : ""} ${interactive ? "interactive" : ""}`} role={interactive ? "button" : undefined} tabIndex={interactive ? 0 : undefined} aria-pressed={interactive ? selected === name : undefined} aria-label={interactive ? `${selected === name ? "Clear" : "Select"} ${name}` : undefined} onClick={() => onSelect?.(selected === name ? "" : name)} onKeyDown={event => { if (interactive && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); onSelect(selected === name ? "" : name); } }}><title>{name}</title>{shapes}</g>;
  const joints = <g className="anatomy-joints" aria-hidden="true"><circle cx="104" cy="151" r="6"/><circle cx="216" cy="151" r="6"/><circle cx="74" cy="253" r="6"/><circle cx="246" cy="253" r="6"/><circle cx="53" cy="353" r="6"/><circle cx="267" cy="353" r="6"/><circle cx="125" cy="523" r="6"/><circle cx="195" cy="523" r="6"/></g>;
  const female = gender === "female";

  return <svg className={`anatomy-figure ${gender} ${view.toLowerCase()} ${compact ? "compact" : ""}`} viewBox="0 0 320 640" role="img" aria-label={`${gender} ${view.toLowerCase()} anatomical muscle illustration`}>
    <g className="anatomy-outline" aria-hidden="true">
      <path d={female ? "M139 27 Q160 8 181 27 L184 61 Q181 87 160 96 Q139 87 136 61Z" : "M137 24 Q160 7 183 24 L187 61 Q183 88 160 98 Q137 88 133 61Z"}/>
      {female && <path d="M138 31 Q126 53 137 82 M182 31 Q194 53 183 82"/>}
      <path d={female ? "M143 92 L140 116 Q116 124 96 143 Q82 171 75 209 Q60 236 47 277 L31 342 Q26 356 36 365 Q47 371 54 351 L68 300 Q83 281 95 260 Q100 244 105 225 L111 310 Q103 352 108 391 L116 492 Q117 514 121 535 L117 609 Q118 628 132 630 Q143 626 144 610 L151 532 L160 432 L169 532 L176 610 Q177 626 188 630 Q202 628 203 609 L199 535 Q203 514 204 492 L212 391 Q217 352 209 310 L215 225 Q220 244 225 260 Q237 281 252 300 L266 351 Q273 371 284 365 Q294 356 289 342 L273 277 Q260 236 245 209 Q238 171 224 143 Q204 124 180 116 L177 92" : "M142 93 L138 116 Q105 124 88 145 Q72 179 68 212 Q54 240 43 276 L27 340 Q22 356 33 365 Q44 370 51 350 L66 298 Q81 278 92 257 L103 220 L109 311 Q101 349 106 391 L115 493 Q116 514 120 534 L116 609 Q117 628 132 631 Q145 626 146 609 L152 531 L160 432 L168 531 L174 609 Q175 626 188 631 Q203 628 204 609 L200 534 Q204 514 205 493 L214 391 Q219 349 211 311 L217 220 L228 257 Q239 278 254 298 L269 350 Q276 370 287 365 Q298 356 293 340 L277 276 Q266 240 252 212 Q248 179 232 145 Q215 124 182 116 L178 93"}/>
    </g>
    {view === "Front" ? <>
      {region("Shoulders", <><path d="M139 121 Q116 120 96 140 Q84 154 82 181 Q101 177 116 165 Q127 153 139 144Z"/><path d="M181 121 Q204 120 224 140 Q236 154 238 181 Q219 177 204 165 Q193 153 181 144Z"/></>)}
      {region("Chest", <><path d="M141 125 Q119 126 104 146 Q108 177 128 190 Q146 196 157 181 L157 136 Q152 126 141 125Z"/><path d="M179 125 Q201 126 216 146 Q212 177 192 190 Q174 196 163 181 L163 136 Q168 126 179 125Z"/></>)}
      {region("Biceps", <><path d="M91 184 Q75 193 71 224 Q70 248 82 263 Q98 248 104 217 Q105 194 91 184Z"/><path d="M229 184 Q245 193 249 224 Q250 248 238 263 Q222 248 216 217 Q215 194 229 184Z"/></>)}
      {region("Forearms", <><path d="M70 258 Q57 274 49 307 L38 344 Q42 354 52 347 L66 311 Q76 292 82 270Z"/><path d="M250 258 Q263 274 271 307 L282 344 Q278 354 268 347 L254 311 Q244 292 238 270Z"/></>)}
      {region("Core", <><path d="M143 195 Q153 188 157 200 L157 320 Q151 339 140 346 Q128 334 124 313 L127 226 Q130 204 143 195Z"/><path d="M177 195 Q167 188 163 200 L163 320 Q169 339 180 346 Q192 334 196 313 L193 226 Q190 204 177 195Z"/><path className="muscle-detail" d="M132 224 Q145 217 157 222 M129 250 Q143 244 157 249 M128 277 Q143 271 157 276 M128 304 Q143 298 157 303 M188 224 Q175 217 163 222 M191 250 Q177 244 163 249 M192 277 Q177 271 163 276 M192 304 Q177 298 163 303"/></>)}
      {region("Obliques", <><path d="M122 194 Q108 207 106 239 L108 303 Q112 326 130 342 Q120 298 124 249 Q127 216 122 194Z"/><path d="M198 194 Q212 207 214 239 L212 303 Q208 326 190 342 Q200 298 196 249 Q193 216 198 194Z"/></>)}
      {region("Quads", <><path d={female ? "M118 344 Q101 374 108 423 L116 487 Q123 508 139 511 Q151 492 151 449 L146 370 Q139 346 118 344Z" : "M115 344 Q99 376 106 423 L115 488 Q124 510 140 512 Q153 489 151 448 L146 370 Q137 345 115 344Z"}/><path d={female ? "M202 344 Q219 374 212 423 L204 487 Q197 508 181 511 Q169 492 169 449 L174 370 Q181 346 202 344Z" : "M205 344 Q221 376 214 423 L205 488 Q196 510 180 512 Q167 489 169 448 L174 370 Q183 345 205 344Z"}/><path className="muscle-detail" d="M128 356 Q139 395 139 490 M192 356 Q181 395 181 490"/></>)}
      {region("Calves", <><path d="M120 531 Q111 553 116 588 L121 617 Q130 626 138 611 L143 548 Q136 528 120 531Z"/><path d="M200 531 Q209 553 204 588 L199 617 Q190 626 182 611 L177 548 Q184 528 200 531Z"/></>)}
    </> : <>
      {region("Shoulders", <><path d="M139 121 Q111 119 92 142 Q82 159 83 181 Q105 178 124 163 Q136 151 139 121Z"/><path d="M181 121 Q209 119 228 142 Q238 159 237 181 Q215 178 196 163 Q184 151 181 121Z"/></>)}
      {region("Triceps", <><path d="M91 183 Q74 199 72 229 Q73 251 82 265 Q99 246 105 214 Q104 193 91 183Z"/><path d="M229 183 Q246 199 248 229 Q247 251 238 265 Q221 246 215 214 Q216 193 229 183Z"/></>)}
      {region("Lower back", <><path d="M137 173 Q116 187 112 223 L118 305 Q128 329 151 344 L157 210 Q153 183 137 173Z"/><path d="M183 173 Q204 187 208 223 L202 305 Q192 329 169 344 L163 210 Q167 183 183 173Z"/><path className="muscle-detail" d="M160 199 L160 334"/></>)}
      {region("Glutes", <><path d="M118 316 Q137 306 157 326 L157 371 Q139 388 116 369 Q107 349 118 316Z"/><path d="M202 316 Q183 306 163 326 L163 371 Q181 388 204 369 Q213 349 202 316Z"/></>)}
      {region("Hamstrings", <><path d="M116 375 Q105 405 110 452 L119 501 Q130 517 143 501 L151 430 L151 384 Q137 373 116 375Z"/><path d="M204 375 Q215 405 210 452 L201 501 Q190 517 177 501 L169 430 L169 384 Q183 373 204 375Z"/></>)}
      {region("Calves", <><path d="M120 521 Q109 551 115 591 L121 617 Q132 628 140 607 L144 548 Q136 522 120 521Z"/><path d="M200 521 Q211 551 205 591 L199 617 Q188 628 180 607 L176 548 Q184 522 200 521Z"/></>)}
    </>}
    {joints}
  </svg>;
}
