"""
Database setup script for BTS Monitoring System
Run this with: python manage.py shell < setup_database.py
"""

from django.contrib.auth.hashers import make_password
from authentication.models import User, Team
from monitoring.models import Region, Site, Alarm
import random
from decimal import Decimal

print("🚀 Setting up BTS Monitoring Database...")

# Create superuser
if not User.objects.filter(username='admin').exists():
    User.objects.create(
        username='admin',
        email='admin@btsmonitor.com',
        password=make_password('admin123'),
        role='admin',
        is_staff=True,
        is_superuser=True,
        first_name='System',
        last_name='Administrator'
    )
    print('✅ Superuser created: admin/admin123')

# Create teams
teams_data = [
    {'name': 'Power Team', 'team_type': 'power', 'description': 'Handles power-related issues'},
    {'name': 'Transmission Team', 'team_type': 'transmission', 'description': 'Handles transmission issues'},
    {'name': 'BSS Team', 'team_type': 'bss', 'description': 'Handles BSS-related issues'},
    {'name': 'Hardware Team', 'team_type': 'hardware', 'description': 'Handles hardware issues'},
    {'name': 'Security Team', 'team_type': 'security', 'description': 'Handles security issues'},
]

for team_data in teams_data:
    team, created = Team.objects.get_or_create(
        team_type=team_data['team_type'],
        defaults=team_data
    )
    if created:
        print(f'✅ Team created: {team.name}')

# Get teams for user assignment
power_team = Team.objects.get(team_type='power')
transmission_team = Team.objects.get(team_type='transmission')

# Create demo users
demo_users = [
    {
        'username': 'operator1',
        'email': 'operator@btsmonitor.com',
        'password': make_password('operator123'),
        'role': 'operator',
        'first_name': 'John',
        'last_name': 'Operator',
        'team': power_team
    },
    {
        'username': 'tech1',
        'email': 'tech@btsmonitor.com',
        'password': make_password('tech123'),
        'role': 'technician',
        'first_name': 'Jane',
        'last_name': 'Technician',
        'team': transmission_team
    }
]

for user_data in demo_users:
    user, created = User.objects.get_or_create(
        username=user_data['username'],
        defaults=user_data
    )
    if created:
        print(f'✅ Demo user created: {user.username}')

# Create regions
regions_data = [
    {'name': 'Adamaoua', 'code': 'ADA'},
    {'name': 'Centre', 'code': 'CEN'},
    {'name': 'Est', 'code': 'EST'},
    {'name': 'Extrême-Nord', 'code': 'ENO'},
    {'name': 'Littoral', 'code': 'LIT'},
    {'name': 'Nord', 'code': 'NOR'},
    {'name': 'Nord-Ouest', 'code': 'NOO'},
    {'name': 'Ouest', 'code': 'OUE'},
    {'name': 'Sud', 'code': 'SUD'},
    {'name': 'Sud-Ouest', 'code': 'SUO'},
]

for region_data in regions_data:
    region, created = Region.objects.get_or_create(
        code=region_data['code'],
        defaults=region_data
    )
    if created:
        print(f'✅ Region created: {region.name}')

# Create sample sites
cameroon_coords = [
    (11.502, 3.848),   # Yaoundé area
    (13.712, 9.308),   # Maroua area
    (9.767, 4.061),    # Douala area
    (10.149, 5.969),   # Bamenda area
    (11.917, 3.521),   # Bertoua area
    (12.354, 7.326),   # Ngaoundéré area
    (15.053, 10.591),  # Garoua area
    (10.686, 5.956),   # Bafoussam area
    (11.855, 2.928),   # Ebolowa area
    (9.266, 4.154),    # Buea area
]

regions = Region.objects.all()
for i, region in enumerate(regions):
    for j in range(5):  # 5 sites per region
        site_code = f'{region.code}-{j+1:03d}'
        base_coords = cameroon_coords[i % len(cameroon_coords)]
        
        site, created = Site.objects.get_or_create(
            code=site_code,
            defaults={
                'name': f'BTS-{site_code}',
                'region': region,
                'latitude': Decimal(str(base_coords[1] + random.uniform(-0.5, 0.5))),
                'longitude': Decimal(str(base_coords[0] + random.uniform(-0.5, 0.5))),
                'status': random.choice(['active', 'inactive', 'maintenance']),
                'ip_address': f'192.168.{i+1}.{j+1}'
            }
        )
        if created:
            print(f'✅ Site created: {site.name}')

# Create sample alarms
alarm_types = ['power', 'ip', 'transmission', 'bss', 'hardware', 'security']
severities = ['critical', 'major', 'minor', 'warning']
alarm_titles = {
    'power': ['Power outage detected', 'Generator failure', 'Battery low', 'UPS malfunction'],
    'ip': ['Network connectivity lost', 'High latency detected', 'Packet loss', 'Router failure'],
    'transmission': ['Signal degradation', 'Antenna misalignment', 'Interference detected', 'Cable fault'],
    'bss': ['BSC overload', 'Database corruption', 'Synchronization error', 'Memory overflow'],
    'hardware': ['CPU overheating', 'Disk failure', 'Fan malfunction', 'Memory error'],
    'security': ['Unauthorized access', 'Certificate expired', 'Firewall breach', 'Malware detected']
}

sites = Site.objects.all()
for i in range(20):  # Create 20 sample alarms
    site = random.choice(sites)
    alarm_type = random.choice(alarm_types)
    severity = random.choice(severities)
    title = random.choice(alarm_titles[alarm_type])
    
    alarm, created = Alarm.objects.get_or_create(
        site=site,
        alarm_type=alarm_type,
        title=title,
        defaults={
            'severity': severity,
            'description': f'Detailed description for {title} at {site.name}',
            'status': random.choice(['active', 'acknowledged', 'resolved'])
        }
    )
    if created:
        print(f'✅ Alarm created: {alarm.title} at {site.name}')

print('🎉 Database setup completed successfully!')
print('\n📋 Summary:')
print(f'   👥 Users: {User.objects.count()}')
print(f'   🏢 Teams: {Team.objects.count()}')
print(f'   🗺️  Regions: {Region.objects.count()}')
print(f'   📡 Sites: {Site.objects.count()}')
print(f'   🚨 Alarms: {Alarm.objects.count()}')
print('\n🔑 Login credentials:')
print('   Admin: admin/admin123')
print('   Operator: operator1/operator123')
print('   Technician: tech1/tech123')