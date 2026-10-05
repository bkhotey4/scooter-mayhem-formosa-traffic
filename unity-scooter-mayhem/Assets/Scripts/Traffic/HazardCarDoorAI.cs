using UnityEngine;

namespace ScooterMayhem.Traffic
{
    /// <summary>
    /// Double-parked luxury van / car door hazard event.
    /// Kicks the driver door open when a player scooter approaches from behind!
    /// </summary>
    public class HazardCarDoorAI : MonoBehaviour
    {
        [Header("Door Configuration")]
        [SerializeField] private Transform doorHinge;
        [SerializeField] private float targetOpenAngleDeg = 75f;
        [SerializeField] private float openSpeed = 14f;
        [SerializeField] private float triggerDistance = 14f;

        [Header("Effects & Audio")]
        [SerializeField] private AudioSource doorSound;
        [SerializeField] private GameObject hazardLights;

        private Transform playerTransform;
        private bool isTriggered = false;
        private float currentAngle = 0f;
        private bool dodgeAwarded = false;

        private void Start()
        {
            var player = GameObject.FindGameObjectWithTag("Player");
            if (player != null) playerTransform = player.transform;
        }

        private void Update()
        {
            // Flash hazard lights
            if (hazardLights != null)
            {
                hazardLights.SetActive((Time.time % 0.6f) < 0.3f);
            }

            if (playerTransform == null) return;

            float dist = Vector3.Distance(transform.position, playerTransform.position);

            // Proximity trigger
            if (!isTriggered && dist < triggerDistance)
            {
                Vector3 toPlayer = playerTransform.position - transform.position;
                if (Vector3.Dot(toPlayer, transform.forward) < 0f) // approaching from rear
                {
                    TriggerDoorOpen();
                }
            }

            // Animate door
            if (isTriggered && doorHinge != null)
            {
                currentAngle = Mathf.Lerp(currentAngle, targetOpenAngleDeg, Time.deltaTime * openSpeed);
                doorHinge.localRotation = Quaternion.Euler(0f, currentAngle, 0f);
            }

            // Close-call dodge combo
            if (isTriggered && !dodgeAwarded && dist < 2.5f)
            {
                var controller = playerTransform.GetComponent<Vehicle.ScooterVehicleController>();
                if (controller != null && controller.CurrentSpeedKmH > 25f && !controller.IsCrashed)
                {
                    dodgeAwarded = true;
                    // Trigger Close Call Combo!
                }
            }
        }

        public void TriggerDoorOpen()
        {
            if (isTriggered) return;
            isTriggered = true;
            if (doorSound != null) doorSound.Play();
        }

        private void OnTriggerEnter(Collider other)
        {
            if (other.CompareTag("Player") && isTriggered && currentAngle > 20f)
            {
                var vehicle = other.GetComponentInParent<Vehicle.ScooterVehicleController>();
                if (vehicle != null)
                {
                    vehicle.TriggerCrashWipeout(transform.right, 18f);
                }
            }
        }
    }
}
