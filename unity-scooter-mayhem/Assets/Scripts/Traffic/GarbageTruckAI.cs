using UnityEngine;
using ScooterMayhem.Game;

namespace ScooterMayhem.Traffic
{
    public class GarbageTruckAI : MonoBehaviour
    {
        [Header("Movement")]
        public float crawlSpeed = 4.2f; // ~15 km/h
        public Vector2 roadZBounds = new Vector2(-180f, 180f);

        [Header("Visuals & Audio")]
        public GameObject amberBeaconL;
        public GameObject amberBeaconR;
        public AudioSource maidensPrayerSource;
        public float musicAudibleDistance = 25f;

        [Header("Combo & Overtake")]
        public float overtakeDistance = 3.8f;
        public float minOvertakeSpeed = 8.5f; // ~30 km/h
        public int overtakeScore = 750;

        private Transform playerTransform;
        private bool overtakeAwarded = false;
        private float beaconTimer = 0f;

        private void Start()
        {
            GameObject player = GameObject.FindGameObjectWithTag("Player");
            if (player != null) playerTransform = player.transform;
        }

        private void Update()
        {
            float dt = Time.deltaTime;

            // 1. Move steadily forward along road
            transform.Translate(Vector3.forward * crawlSpeed * dt, Space.Self);
            if (transform.position.z > roadZBounds.y)
            {
                Vector3 pos = transform.position;
                pos.z = roadZBounds.x;
                transform.position = pos;
            }

            // 2. Rotate Amber Emergency Beacons
            beaconTimer += dt * 8f;
            bool bOn = ((int)beaconTimer % 2) == 0;
            if (amberBeaconL != null) amberBeaconL.SetActive(bOn);
            if (amberBeaconR != null) amberBeaconR.SetActive(!bOn);

            if (playerTransform == null) return;

            float dist = Vector3.Distance(transform.position, playerTransform.position);

            // 3. Dynamic Maiden's Prayer sound volume
            if (maidensPrayerSource != null)
            {
                if (dist < musicAudibleDistance)
                {
                    if (!maidensPrayerSource.isPlaying) maidensPrayerSource.Play();
                    maidensPrayerSource.volume = Mathf.Clamp01(1f - (dist / musicAudibleDistance));
                }
                else if (maidensPrayerSource.isPlaying)
                {
                    maidensPrayerSource.Stop();
                }
            }

            // 4. Overtake detection
            if (!overtakeAwarded && dist < overtakeDistance)
            {
                // Check if player is moving faster
                var scooter = playerTransform.GetComponent<Vehicle.ScooterVehicleController>();
                if (scooter != null && scooter.CurrentSpeedKmh > minOvertakeSpeed * 3.6f)
                {
                    overtakeAwarded = true;
                    Debug.Log($"<color=#00E676>【超車清潔隊垃圾車】+{overtakeScore} PTS！</color>");
                    AchievementSystem.Instance?.AddProgress("GARBAGE_HERO", 1);
                    Invoke(nameof(ResetOvertake), 8f);
                }
            }
        }

        private void ResetOvertake()
        {
            overtakeAwarded = false;
        }
    }
}
