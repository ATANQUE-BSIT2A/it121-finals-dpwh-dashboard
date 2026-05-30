import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function AppLayout({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="layout-wrapper">
      <Sidebar />
      <div className="main-area">
        <Topbar title={title} />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  )
}
