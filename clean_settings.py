#!/usr/bin/env python3
"""
Script para limpiar Settings.tsx eliminando tabs no funcionales
"""
import re

def find_block_end(lines, start_idx):
    """Encuentra el final de un bloque basándose en llaves balanceadas"""
    depth = 0
    for i in range(start_idx, len(lines)):
        depth += lines[i].count('{') - lines[i].count('}')
        if depth == 0 and i > start_idx:
            return i
    return len(lines) - 1

def clean_settings():
    with open('src/pages/Settings.tsx', 'r') as f:
        content = f.read()
    
    lines = content.split('\n')
    output = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Detectar bloques de tabs a eliminar
        if "activeTab === 'automation'" in line or \
           "activeTab === 'integrations'" in line or \
           "activeTab === 'team'" in line:
            # Encontrar el final del bloque
            end_idx = find_block_end(lines, i)
            print(f"Eliminando bloque de línea {i+1} a {end_idx+1}")
            i = end_idx + 1
            continue
        
        output.append(line)
        i += 1
    
    # Limpiar también campos del NPS que no funcionan
    result = '\n'.join(output)
    
    # Eliminar campos de NPS automation (nps_delay_hours, nps_reminder_days, nps_auto_send)
    result = re.sub(r'\s*nps_delay_hours:.*?,?\n', '', result)
    result = re.sub(r'\s*nps_reminder_days:.*?,?\n', '', result)
    result = re.sub(r'\s*nps_auto_send:.*?,?\n', '', result)
    
    # Eliminar campos de email automation
    result = re.sub(r'\s*email_from_name:.*?,?\n', '', result)
    result = re.sub(r'\s*email_reply_to:.*?,?\n', '', result)
    
    # Eliminar custom_domain
    result = re.sub(r'\s*custom_domain:.*?,?\n', '', result)
    
    with open('src/pages/Settings.tsx', 'w') as f:
        f.write(result)
    
    print(f"✓ Limpieza completada")

if __name__ == '__main__':
    clean_settings()
