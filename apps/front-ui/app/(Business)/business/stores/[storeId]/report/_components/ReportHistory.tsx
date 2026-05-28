export function ReportHistory({ reports }: { reports: any[] }) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Recently Generated
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border text-left text-sm text-muted-foreground">
              <th className="py-3 px-4">Report</th>
              <th className="py-3 px-4">Period</th>
              <th className="py-3 px-4">Generated At</th>
              <th className="py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r: any) => (
              <tr
                key={r.id}
                className="border-b border-border hover:bg-muted/50"
              >
                <td className="py-3 px-4">{r.reportType.replace("_", " ")}</td>
                <td className="py-3 px-4 capitalize">{r.period}</td>
                <td className="py-3 px-4">
                  {new Date(r.generatedAt).toLocaleString()}
                </td>
                <td className="p-3">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-600 hover:underline font-medium"
                  >
                    View PDF
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
