import { HiOutlineLockClosed } from 'react-icons/hi'
import { FEATURES } from '../constants/features'

export default function FeatureGuard({ feature, children }) {
  if (FEATURES[feature]) return children

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
        <HiOutlineLockClosed className="h-6 w-6 text-gray-400" />
      </div>
      <h3 className="mb-1 text-sm font-semibold text-gray-700">Feature Not Available</h3>
      <p className="max-w-xs text-xs text-gray-500">
        This feature is currently disabled. Please contact your administration for access.
      </p>
    </div>
  )
}
