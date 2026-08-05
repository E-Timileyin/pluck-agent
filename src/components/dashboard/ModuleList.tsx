import { ModuleRow } from './ModuleRow';
import type { Module } from '../../lib/progress';

export function ModuleList(props: { modules: Module[] }) {
  return (
    <div class="grid gap-3 lg:grid-cols-2 lg:gap-5">
      {props.modules.map((module) => (
        <ModuleRow module={module} />
      ))}
    </div>
  );
}

export default ModuleList;
