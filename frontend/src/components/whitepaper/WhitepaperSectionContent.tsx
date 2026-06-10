'use client'

import deployments from '@/lib/deployments.json'
import type { WhitepaperSection } from '@/lib/whitepaper/sections'
import { WhitepaperVisual } from './WhitepaperVisual'

function shortenAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

export function DeploymentsBlock() {
  const { chainId, addresses, pools } = deployments

  const rows: [string, string][] = [
    ['Chain ID', String(chainId)],
    ['YieldVault', addresses.vault],
    ['MochiYieldHook', addresses.hook],
    ['PT Token', addresses.ptToken],
    ['YT Token', addresses.ytToken],
    ['Underlying (wstETH)', addresses.underlying],
    ['WETH', addresses.weth],
    ['Swap Router', addresses.swapRouter],
    ['Pool Manager', addresses.poolManager],
    ['PT Pool ID', pools.pt.poolId],
    ['YT Pool ID', pools.yt.poolId],
  ]

  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-[#F6F5F2] mb-3">
        Current addresses (deployments.json)
      </h3>
      <div className="overflow-x-auto mb-4">
        <table className="w-full text-sm border border-white/[0.06] rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-[#151515]">
              <th className="text-left px-4 py-3 font-semibold text-[#F6F5F2] border-b border-white/[0.06]">
                Contract
              </th>
              <th className="text-left px-4 py-3 font-semibold text-[#F6F5F2] border-b border-white/[0.06]">
                Address
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([name, addr]) => (
              <tr key={name} className="border-b border-white/[0.06] last:border-0">
                <td className="px-4 py-3 text-[#A1A1AA]">{name}</td>
                <td
                  className="px-4 py-3 font-mono text-xs text-[#F6F5F2] break-all"
                  title={addr}
                >
                  {addr.startsWith('0x') && addr.length > 20 ? shortenAddress(addr) : addr}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function WhitepaperSectionContent({ section }: { section: WhitepaperSection }) {
  const isRolesTable = section.id === 'roles'
  const isLifecycleTable = section.id === 'hook-lifecycle'
  const isDeploymentsEnvTable = section.id === 'deployments'
  const useMonoCol1 =
    section.id === 'architecture' ||
    section.id === 'parameters' ||
    section.id === 'events'

  const tableHeaders: [string, string] = isRolesTable
    ? ['Role', 'Description']
    : isDeploymentsEnvTable
      ? ['Environment', 'Details']
      : section.id === 'parameters'
        ? ['Parameter', 'Value']
        : section.id === 'architecture'
          ? ['Contract', 'Role']
          : ['Contract', 'Value / Role']

  return (
    <section id={section.id} className="scroll-mt-28 pb-16 border-b border-white/[0.04] last:border-0">
      <h2 className="font-clash text-2xl font-semibold text-[#F6F5F2] mb-5">
        {section.title}
      </h2>

      {section.paragraphs?.map((p) => (
        <p key={p.slice(0, 40)} className="text-[#A1A1AA] text-[15px] leading-relaxed mb-4">
          {p}
        </p>
      ))}

      {section.code && (
        <pre className="px-4 py-3 bg-[#151515] border border-white/[0.06] rounded-xl text-xs font-mono text-[#F6F5F2] mb-4 overflow-x-auto whitespace-pre-wrap">
          {section.code}
        </pre>
      )}

      {section.list && (
        <ul className="space-y-2.5 mb-4">
          {section.list.map((item) => (
            <li
              key={item.slice(0, 48)}
              className="flex items-start gap-2.5 text-[#A1A1AA] text-[15px] leading-relaxed"
            >
              <span className="w-1.5 h-1.5 bg-[#A6D95B] rounded-full mt-2 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )}

      {section.table && !isLifecycleTable && (
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm border border-white/[0.06] rounded-xl overflow-hidden">
            <thead>
              <tr className="bg-[#151515]">
                <th className="text-left px-4 py-3 font-semibold text-[#F6F5F2] border-b border-white/[0.06]">
                  {tableHeaders[0]}
                </th>
                <th className="text-left px-4 py-3 font-semibold text-[#F6F5F2] border-b border-white/[0.06]">
                  {tableHeaders[1]}
                </th>
              </tr>
            </thead>
            <tbody>
              {section.table.map(([col1, col2]) => (
                <tr key={col1} className="border-b border-white/[0.06] last:border-0">
                  <td
                    className={`px-4 py-3 align-top ${
                      useMonoCol1
                        ? 'font-mono text-xs text-[#F6F5F2]'
                        : 'text-[#F6F5F2] text-sm font-medium'
                    }`}
                  >
                    {col1}
                  </td>
                  <td className="px-4 py-3 text-[#A1A1AA] align-top">{col2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isLifecycleTable && section.table && (
        <div className="space-y-3 mb-4">
          {section.table.map(([phase, detail]) => (
            <div
              key={phase}
              className="flex gap-4 rounded-xl border border-white/[0.06] bg-[#101010] px-4 py-3"
            >
              <span className="font-mono text-xs text-[#FF92B3] shrink-0 w-28">{phase}</span>
              <span className="text-sm text-[#A1A1AA]">{detail}</span>
            </div>
          ))}
        </div>
      )}

      {section.id === 'deployments' && <DeploymentsBlock />}

      {section.visual && (
        <WhitepaperVisual id={section.visual} caption={section.visualCaption} />
      )}

      {section.footer && (
        <p className="text-[#71717A] text-sm leading-relaxed mt-2">{section.footer}</p>
      )}
    </section>
  )
}
